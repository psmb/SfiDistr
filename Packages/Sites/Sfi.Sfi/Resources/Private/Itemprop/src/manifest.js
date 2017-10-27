import React from 'react';
import manifest from '@neos-project/neos-ui-extensibility';
import omit from 'lodash.omit';
import itemprop from './itemprop';
import {IconButton} from '@neos-project/react-ui-components';

const IconButtonComponent = props => {
    const finalProps = omit(props, ['formattingRule']);
    return (<IconButton {...finalProps}/>);
};

manifest('Sfi.Site:Itemprop', {}, globalRegistry => {
    const plugins = globalRegistry.get('ckEditor').get('plugins');
    const formattingRules = globalRegistry.get('ckEditor').get('formattingRules');
    const richtextToolbar = globalRegistry.get('ckEditor').get('richtextToolbar');

    plugins.set('itemprop', {
        initFn: itemprop
    });

    formattingRules.set('itemprop', {
        command: 'itemprop',
        config: formattingRules.config.addToExtraAllowedContent('*[itemprop]')
    });

    richtextToolbar.set('itemprop', {
        formattingRule: 'itemprop',
        component: IconButtonComponent,
        callbackPropName: 'onClick',

        icon: 'bug',
        hoverStyle: 'brand'
    });
});
