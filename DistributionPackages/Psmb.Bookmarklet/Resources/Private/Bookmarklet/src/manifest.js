import manifest from '@neos-project/neos-ui-extensibility';
import BookmarkletContainer from './Bookmarklet';

manifest('Psmb.Bookmarklet:Bookmarklet', {}, globalRegistry => {
    const containerRegistry = globalRegistry.get('containers');
    containerRegistry.set('PrimaryToolbar/Right/Bookmarklet', BookmarkletContainer, 'before PrimaryToolbar/Right/UserDropDown');
});
