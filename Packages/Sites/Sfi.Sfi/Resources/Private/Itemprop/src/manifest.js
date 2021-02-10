import manifest from '@neos-project/neos-ui-extensibility';
import ItempropPlugin from './itempropPlugin';
import LinkSignaturePlugin from './LinkSignaturePlugin';
import ItempropButton from './ItempropButton';
import LinkEditorOptions from './LinkEditorOptions';
import {$add, $get} from 'plow-js'

const addPlugin = (Plugin, isEnabled) => (ckEditorConfiguration, options) => {
    if (!isEnabled || isEnabled(options.editorOptions, options)) {
        ckEditorConfiguration.plugins = ckEditorConfiguration.plugins || [];
        return $add('plugins', Plugin, ckEditorConfiguration);
    }
    return ckEditorConfiguration;
};

manifest('Psmb.Itemprop:Itemprop', {}, globalRegistry => {
    const richtextToolbar = globalRegistry.get('ckEditor5').get('richtextToolbar');
    richtextToolbar.set('itemprop', {
        component: ItempropButton,
        isVisible: a => $get('formatting.itemprop', a) && $get('formatting.table', a)
    });
    richtextToolbar.set('sign', {
        component: ItempropButton,
        isVisible: a => true
    });

    const config = globalRegistry.get('ckEditor5').get('config');
    config.set('itemprop', addPlugin(ItempropPlugin, a => $get('formatting.itemprop', a) && $get('formatting.table', a)), 'after table');
    config.set('signee', addPlugin(LinkSignaturePlugin, a => $get('formatting.table', a)), 'after table');

    const containerRegistry = globalRegistry.get("containers");
    containerRegistry.set(
        "LinkInput/OptionsPanel/LinkEditorOptions",
        LinkEditorOptions
    );
});
