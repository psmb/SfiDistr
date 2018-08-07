import React, {PureComponent, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {$get, $transform} from 'plow-js';

import {IconButton, TextInput} from '@neos-project/react-ui-components';
import {neos} from '@neos-project/neos-ui-decorators';
import {executeCommand} from '@neos-project/neos-ui-ckeditor5-bindings';

import {selectors} from '@neos-project/neos-ui-redux-store';

import style from './style.css';

@connect($transform({
    formattingUnderCursor: selectors.UI.ContentCanvas.formattingUnderCursor
}))
@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
export default class ItempropButton extends PureComponent {
    static propTypes = {
        formattingUnderCursor: PropTypes.objectOf(PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.bool,
            PropTypes.string,
            PropTypes.object
        ])),
        inlineEditorOptions: PropTypes.object,
        i18nRegistry: PropTypes.object.isRequired
    };

    state = {
        isOpen: false
    };

    componentWillReceiveProps(nextProps) {
        // if new selection doesn't have itemprop, close the itemprop dialog
        if (!$get('itemprop', nextProps.formattingUnderCursor)) {
            this.setState({isOpen: false});
        }
    }

    handleItempropButtonClick = () => {
        if (this.isOpen()) {
            if ($get('itemprop', this.props.formattingUnderCursor) !== undefined) {
                executeCommand('itemprop');
            }
            this.setState({isOpen: false});
        } else {
            this.setState({isOpen: true});
        }
    }

    render() {
        const {i18nRegistry, formattingUnderCursor, inlineEditorOptions } = this.props;

        return (
            <div>
                <IconButton
                    title={this.getItemprop() ? `${i18nRegistry.translate('Psmb.Itemprop:Main:removeItemprop', 'Удалить itemprop')}` : `${i18nRegistry.translate('Psmb.Itemprop:Main:insertItemprop', 'itemprop')}`}
                    isActive={this.isOpen()}
                    icon={this.getItemprop() ? 'ban' : 'bug'}
                    onClick={this.handleItempropButtonClick}
                />
                {this.isOpen() ? <ItempropTextField itempropValue={this.getItemprop()} formattingUnderCursor={formattingUnderCursor} inlineEditorOptions={inlineEditorOptions} /> : null}
            </div>
        );
    }

    isOpen() {
        return Boolean(this.state.isOpen || this.getItemprop());
    }

    getItemprop() {
        return $get('itemprop', this.props.formattingUnderCursor) || '';
    }
}

@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
class ItempropTextField extends PureComponent {
    static propTypes = {
        i18nRegistry: PropTypes.object,
        itempropValue: PropTypes.string,
        inlineEditorOptions: PropTypes.object
    };

    render() {
        return (
            <div className={style.flyout}>
                <TextInput
                    value={this.props.itempropValue}
                    autoFocus
                    placeholder={this.props.i18nRegistry.translate('Psmb.Itemprop:Main:placeholder', 'Введите атрибут itemprop')}
                    onChange={value => {
                        executeCommand('itemprop', value, false);
                    }}
                />
            </div>
        );
    }
}
