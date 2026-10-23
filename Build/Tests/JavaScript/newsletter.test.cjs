const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const extension = path.resolve(__dirname, '../../../DistributionPackages/Psmb.Newsletter/Resources/Private/NewsletterView');
const extensionRequire = createRequire(path.join(extension, 'package.json'));
const babel = extensionRequire('babel-core');

// Exercise the real component methods; only host UI dependencies and HTTP are replaced.
function loadComponent(filename, fetch) {
    function Component(props) { this.props = props; }
    Component.prototype.setState = function (patch) { Object.assign(this.state, patch); };
    const propType = () => {};
    propType.isRequired = propType;
    const props = {string: propType, bool: propType, object: propType, func: propType, node: propType};
    const source = fs.readFileSync(path.join(extension, 'src', filename), 'utf8');
    const compiled = babel.transform(source, {
        babelrc: false,
        presets: ['babel-preset-es2015', 'babel-preset-react', 'babel-preset-stage-0'].map(extensionRequire.resolve),
        plugins: [extensionRequire.resolve('babel-plugin-transform-decorators-legacy')]
    }).code;
    const module = {exports: {}};
    vm.runInNewContext(compiled, {
        module, exports: module.exports, fetch, URLSearchParams,
        document: {getElementById: () => ({dataset: {csrfToken: 'fixture-csrf'}})},
        require: name => {
            if (name === 'react') return {Component, PureComponent: Component};
            if (name === 'prop-types') return props;
            if (name === 'react-redux') return {connect: () => component => component};
            if (name === '@neos-project/neos-ui-decorators') return {neos: () => component => component};
            return {};
        }
    });
    return module.exports.default;
}

for (const context of ['/sites/sfi/mail@user-editor;language=ru;country=de', '/sites/sfi/mail@user-editor']) {
    test(`preview and send preserve identical recipient filters: ${context}`, async () => {
        const requests = [];
        const fetch = async (url, options = {}) => {
            requests.push({url, options});
            return {ok: true, json: async () => url.includes('preview') ? [] : {status: 'success'}};
        };
        const filters = {startDate: '2026-09-01', endDate: '', group: 'chapel & projects'};
        const Newsletter = loadComponent('NewsletterView.js', fetch);
        const Preview = loadComponent('ConfirmationDialog.js', fetch);
        const view = new Newsletter({focusedNodeContextPath: context, options: {dataSourceAdditionalArguments: filters}});
        view.state.selectedSubscription = 'datasource-chapel';
        const preview = new Preview({isOpen: true, subscription: 'datasource-chapel', dataSourceAdditionalArguments: filters});
        preview.fetchPreview();
        view.sendNewsletter();
        view.sendTestNewsletter('fixture@example.invalid');
        await new Promise(setImmediate);
        assert.equal(requests.length, 3);
        const previewQuery = new URL(requests[0].url, 'https://example.invalid').searchParams;
        for (const request of requests.slice(1)) {
            const data = request.options.body;
            assert.equal(data.get('node'), context.replace('@user-editor', '@live'));
            assert.equal(data.get('__csrfToken'), 'fixture-csrf');
            assert.equal(data.get('subscription'), 'datasource-chapel');
            for (const [key, value] of Object.entries(filters)) {
                assert.equal(data.get(`dataSourceAdditionalArguments[${key}]`), value);
                assert.equal(data.get(`dataSourceAdditionalArguments[${key}]`), previewQuery.get(`dataSourceAdditionalArguments[${key}]`));
            }
        }
        assert.equal(requests[2].options.body.get('email'), 'fixture@example.invalid');
        assert.equal(view.state.isSent, true);
    });
}

test('failed requests show an error instead of success', async () => {
    const Newsletter = loadComponent('NewsletterView.js', async () => { throw new Error('Fixture offline'); });
    const view = new Newsletter({focusedNodeContextPath: '/sites/sfi/news@user-editor;language=ru'});
    view.state.selectedSubscription = 'instant_ru';
    view.sendNewsletter();
    await new Promise(setImmediate);
    assert.equal(view.state.isError, true);
    assert.notEqual(view.state.isSent, true);
});
