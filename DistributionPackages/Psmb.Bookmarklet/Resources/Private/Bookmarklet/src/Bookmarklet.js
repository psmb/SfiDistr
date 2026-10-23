import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {$get, $transform} from 'plow-js';
import {Icon} from '@neos-project/react-ui-components';
import {connect} from 'react-redux';

@connect($transform({
    workspaceName: $get('cr.workspaces.personalWorkspace.name')
}))
export default class Bookmarklet extends Component {
    static propTypes = {
        workspaceName: PropTypes.string.isRequired
    };

    render() {
        const script = `(function(){var node=document.querySelector('[data-neos-node]');if(node){window.location='/neos/content?node='+encodeURIComponent(node.dataset.neosNode.replace('@live',${JSON.stringify('@' + this.props.workspaceName)}));}})()`;
        const link = `javascript:${encodeURIComponent(script)}`;
        return (
            <div style={{display: 'inline-block', marginTop: '9px'}}>
                <a
                    title="Open this page in Neos (drag this link to your bookmarks bar)"
                    href={link}>
                    <Icon icon="neos" size="1x" />
                    <span style={{display: 'none'}}>Neos</span>
                </a>
            </div>
        );
    }
}
