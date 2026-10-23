import manifest from '@neos-project/neos-ui-extensibility';
import FootnotePlugin from './footnotePlugin';
import FootnoteButton from './FootnoteButton';
import {$add, $get} from 'plow-js'

const addPlugin = (Plugin, isEnabled) => (ckEditorConfiguration, options) => {
    if (!isEnabled || isEnabled(options.editorOptions, options)) {
        ckEditorConfiguration.plugins = ckEditorConfiguration.plugins || [];
        return $add('plugins', Plugin, ckEditorConfiguration);
    }
    return ckEditorConfiguration;
};

manifest('Psmb.Footnote:Footnote', {}, globalRegistry => {
    const richtextToolbar = globalRegistry.get('ckEditor5').get('richtextToolbar');
    richtextToolbar.set('footnote', {
        component: FootnoteButton,
        isVisible: $get('formatting.footnote')
    }, 'before strong');

    const config = globalRegistry.get('ckEditor5').get('config');
    config.set('footnote', addPlugin(FootnotePlugin));
});
