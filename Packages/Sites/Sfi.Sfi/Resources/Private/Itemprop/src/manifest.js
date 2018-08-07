import manifest from '@neos-project/neos-ui-extensibility';
import ItempropPlugin from './itempropPlugin';
import ItempropButton from './ItempropButton';
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
        isVisible: $get('formatting.itemprop')
    });

    const config = globalRegistry.get('ckEditor5').get('config');
    config.set('itemprop', addPlugin(ItempropPlugin));
});
