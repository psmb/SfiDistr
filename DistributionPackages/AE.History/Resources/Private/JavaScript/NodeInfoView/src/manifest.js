import manifest from '@neos-project/neos-ui-extensibility';

import NodeInfoView from './NodeInfoView';

manifest('AE.History/Views/NodeInfoView', {}, globalRegistry => {
    const viewsRegistry = globalRegistry.get('inspector').get('views');

    viewsRegistry.set('AE.History/Views/NodeInfoView', {
        component: NodeInfoView
    });
});
