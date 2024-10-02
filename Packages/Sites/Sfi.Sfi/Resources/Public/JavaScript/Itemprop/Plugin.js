/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = readFromConsumerApi;
function readFromConsumerApi(key) {
    return function () {
        if (window['@Neos:HostPluginAPI'] && window['@Neos:HostPluginAPI']['@' + key]) {
            var _window$NeosHostPlu;

            return (_window$NeosHostPlu = window['@Neos:HostPluginAPI'])['@' + key].apply(_window$NeosHostPlu, arguments);
        }

        throw new Error('You are trying to read from a consumer api that hasn\'t been initialized yet!');
    };
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('vendor')().CkEditor5;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('vendor')().plow;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('vendor')().React;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('vendor')().PropTypes;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('vendor')().reactRedux;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('NeosProjectPackages')().ReactUiComponents;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('NeosProjectPackages')().CkEditorApi;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('NeosProjectPackages')().NeosUiReduxStore;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(10);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _neosUiExtensibility = __webpack_require__(11);

var _neosUiExtensibility2 = _interopRequireDefault(_neosUiExtensibility);

var _itempropPlugin = __webpack_require__(15);

var _itempropPlugin2 = _interopRequireDefault(_itempropPlugin);

var _LinkSignaturePlugin = __webpack_require__(22);

var _LinkSignaturePlugin2 = _interopRequireDefault(_LinkSignaturePlugin);

var _ItempropButton = __webpack_require__(27);

var _ItempropButton2 = _interopRequireDefault(_ItempropButton);

var _LinkEditorOptions = __webpack_require__(34);

var _LinkEditorOptions2 = _interopRequireDefault(_LinkEditorOptions);

var _plowJs = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addPlugin = function addPlugin(Plugin, isEnabled) {
    return function (ckEditorConfiguration, options) {
        if (!isEnabled || isEnabled(options.editorOptions, options)) {
            ckEditorConfiguration.plugins = ckEditorConfiguration.plugins || [];
            return (0, _plowJs.$add)('plugins', Plugin, ckEditorConfiguration);
        }
        return ckEditorConfiguration;
    };
};

(0, _neosUiExtensibility2.default)('Psmb.Itemprop:Itemprop', {}, function (globalRegistry) {
    var richtextToolbar = globalRegistry.get('ckEditor5').get('richtextToolbar');
    richtextToolbar.set('itemprop', {
        component: _ItempropButton2.default,
        isVisible: function isVisible(a) {
            return (0, _plowJs.$get)('formatting.itemprop', a) && (0, _plowJs.$get)('formatting.table', a);
        }
    });

    var config = globalRegistry.get('ckEditor5').get('config');
    config.set('itemprop', addPlugin(_itempropPlugin2.default, function (a) {
        return (0, _plowJs.$get)('formatting.itemprop', a) && (0, _plowJs.$get)('formatting.table', a);
    }), 'after table');
    config.set('signature', addPlugin(_LinkSignaturePlugin2.default, function (a) {
        return (0, _plowJs.$get)('formatting.table', a);
    }), 'after table');

    var containerRegistry = globalRegistry.get("containers");
    containerRegistry.set("LinkInput/OptionsPanel/LinkEditorOptions", _LinkEditorOptions2.default);
});

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createConsumerApi = undefined;

var _createConsumerApi = __webpack_require__(12);

var _createConsumerApi2 = _interopRequireDefault(_createConsumerApi);

var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _readFromConsumerApi2.default)('manifest');
exports.createConsumerApi = _createConsumerApi2.default;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = createConsumerApi;

var _package = __webpack_require__(13);

var _manifest = __webpack_require__(14);

var _manifest2 = _interopRequireDefault(_manifest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createReadOnlyValue = function createReadOnlyValue(value) {
    return {
        value: value,
        writable: false,
        enumerable: false,
        configurable: true
    };
};

function createConsumerApi(manifests, exposureMap) {
    var api = {};

    Object.keys(exposureMap).forEach(function (key) {
        Object.defineProperty(api, key, createReadOnlyValue(exposureMap[key]));
    });

    Object.defineProperty(api, '@manifest', createReadOnlyValue((0, _manifest2.default)(manifests)));

    Object.defineProperty(window, '@Neos:HostPluginAPI', createReadOnlyValue(api));
    Object.defineProperty(window['@Neos:HostPluginAPI'], 'VERSION', createReadOnlyValue(_package.version));
}

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = {"name":"@neos-project/neos-ui-extensibility","version":"1.3.2","description":"Extensibility mechanisms for the Neos CMS UI","main":"./src/index.js","scripts":{"prebuild":"check-dependencies && yarn clean","test":"yarn jest -- -w 2 --coverage","test:watch":"yarn jest -- --watch","build":"exit 0","build:watch":"exit 0","clean":"rimraf ./lib ./dist","lint":"eslint src","jest":"NODE_ENV=test jest"},"devDependencies":{"@neos-project/babel-preset-neos-ui":"1.3.2","@neos-project/jest-preset-neos-ui":"1.3.2"},"dependencies":{"@neos-project/build-essentials":"1.3.2","@neos-project/positional-array-sorter":"1.3.2","babel-core":"^6.13.2","babel-eslint":"^7.1.1","babel-loader":"^7.1.2","babel-plugin-transform-decorators-legacy":"^1.3.4","babel-plugin-transform-object-rest-spread":"^6.20.1","babel-plugin-webpack-alias":"^2.1.1","babel-preset-es2015":"^6.13.2","babel-preset-react":"^6.3.13","babel-preset-stage-0":"^6.3.13","chalk":"^1.1.3","css-loader":"^0.28.4","file-loader":"^1.1.5","json-loader":"^0.5.4","postcss-loader":"^2.0.10","react-dev-utils":"^0.5.0","style-loader":"^0.21.0"},"bin":{"neos-react-scripts":"./bin/neos-react-scripts.js"},"jest":{"preset":"@neos-project/jest-preset-neos-ui"}}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = function (manifests) {
    return function manifest(identifier, options, bootstrap) {
        manifests.push(_defineProperty({}, identifier, {
            options: options,
            bootstrap: bootstrap
        }));
    };
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tomap = __webpack_require__(16);

var _tomap2 = _interopRequireDefault(_tomap);

var _ckeditor5Exports = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ITEMPROP = 'itemprop';

function findItemprop(position, value) {
    return new _ckeditor5Exports.ModelRange(_findBound(position, value, true), _findBound(position, value, false));
}

function _findBound(position, value, lookBack) {
    var node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

    var lastNode = null;

    while (node && node.getAttribute(ITEMPROP) === value) {
        lastNode = node;
        node = lookBack ? node.previousSibling : node.nextSibling;
    }

    return lastNode ? _ckeditor5Exports.ModelPosition._createAt(lastNode, lookBack ? 'before' : 'after') : position;
}

var ItempropCommand = function (_Command) {
    _inherits(ItempropCommand, _Command);

    function ItempropCommand() {
        _classCallCheck(this, ItempropCommand);

        return _possibleConstructorReturn(this, (ItempropCommand.__proto__ || Object.getPrototypeOf(ItempropCommand)).apply(this, arguments));
    }

    _createClass(ItempropCommand, [{
        key: 'refresh',
        value: function refresh() {
            var model = this.editor.model;
            var doc = model.document;

            this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, ITEMPROP);
            if (doc.selection.hasAttribute(ITEMPROP)) {
                this.value = doc.selection.getAttribute(ITEMPROP);
            } else {
                var parent = doc.selection.getFirstPosition().parent;
                if (parent && parent.hasAttribute(ITEMPROP)) {
                    this.value = parent.getAttribute(ITEMPROP);
                } else {
                    var grandParent = parent.parent;
                    if (grandParent && grandParent.hasAttribute(ITEMPROP)) {
                        this.value = grandParent.getAttribute(ITEMPROP);
                    } else {
                        this.value = undefined;
                    }
                }
            }
        }
    }, {
        key: 'execute',
        value: function execute(value) {
            var model = this.editor.model;
            var doc = model.document;
            var selection = doc.selection;
            value = value === undefined ? false : value;

            model.change(function (writer) {
                if (selection.isCollapsed) {
                    var position = selection.getFirstPosition().parent;

                    if (selection.hasAttribute(ITEMPROP)) {
                        var itempropRange = findItemprop(selection.getFirstPosition(), selection.getAttribute(ITEMPROP));
                        if (value === false) {
                            writer.removeAttribute(ITEMPROP, itempropRange);
                        } else {
                            writer.setAttribute(ITEMPROP, value, itempropRange);
                            writer.setSelection(itempropRange);
                        }
                    } else {
                        if (value === false) {
                            writer.removeAttribute(ITEMPROP, position);
                        } else {
                            writer.setAttribute(ITEMPROP, value, position);
                        }
                    }
                } else {
                    var ranges = model.schema.getValidRanges(selection.getRanges(), ITEMPROP);

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = ranges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var range = _step.value;

                            if (value === false) {
                                writer.removeAttribute(ITEMPROP, range);
                            } else {
                                writer.setAttribute(ITEMPROP, value, range);
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
            });
        }
    }]);

    return ItempropCommand;
}(_ckeditor5Exports.Command);

var Itemprop = function (_Plugin) {
    _inherits(Itemprop, _Plugin);

    function Itemprop() {
        _classCallCheck(this, Itemprop);

        return _possibleConstructorReturn(this, (Itemprop.__proto__ || Object.getPrototypeOf(Itemprop)).apply(this, arguments));
    }

    _createClass(Itemprop, [{
        key: 'init',
        value: function init() {
            var editor = this.editor;
            editor.model.schema.extend('$block', { allowAttributes: ITEMPROP });
            editor.model.schema.extend('$text', { allowAttributes: ITEMPROP });
            editor.model.schema.extend('tableCell', { allowAttributes: ITEMPROP });

            var schema = this.editor.model.schema;

            this.editor.conversion.for('upcast').elementToAttribute({
                view: {
                    name: 'span',
                    key: ITEMPROP,
                    attributes: _defineProperty({}, ITEMPROP, true)
                },
                model: {
                    key: ITEMPROP,
                    value: function value(viewElement) {
                        return viewElement.getAttribute('itemprop');
                    }
                }
            });

            this.editor.conversion.for('upcast').attributeToAttribute({
                view: ITEMPROP,
                model: ITEMPROP
            });

            this.editor.conversion.for('downcast').attributeToElement({
                model: {
                    key: ITEMPROP,
                    name: '$text'
                },
                view: function view(value, writer) {
                    return writer.createAttributeElement('span', _defineProperty({}, ITEMPROP, value));
                }
            });

            this.editor.conversion.for('downcast').attributeToAttribute({
                model: {
                    key: ITEMPROP,
                    name: 'tableCell'
                },
                view: ITEMPROP
            });

            this.editor.conversion.for('downcast').attributeToAttribute({
                model: {
                    key: ITEMPROP,
                    name: 'paragraph'
                },
                view: ITEMPROP
            });

            editor.commands.add(ITEMPROP, new ItempropCommand(this.editor));
        }
    }], [{
        key: 'pluginName',
        get: function get() {
            return 'Itemprop';
        }
    }]);

    return Itemprop;
}(_ckeditor5Exports.Plugin);

exports.default = Itemprop;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toMap;

var _isPlainObject = __webpack_require__(17);

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _objecttomap = __webpack_require__(21);

var _objecttomap2 = _interopRequireDefault(_objecttomap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Transforms object or iterable to map. Iterable needs to be in the format acceptable by the `Map` constructor.
 *
 *		map = toMap( { 'foo': 1, 'bar': 2 } );
 *		map = toMap( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );
 *		map = toMap( anotherMap );
 *
 * @param {Object|Iterable} data Object or iterable to transform.
 * @returns {Map} Map created from data.
 */
/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/tomap
 */

function toMap(data) {
  if ((0, _isPlainObject2.default)(data)) {
    return (0, _objecttomap2.default)(data);
  } else {
    return new Map(data);
  }
}

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototype = __webpack_require__(18);

var _getPrototype2 = _interopRequireDefault(_getPrototype);

var _isHostObject = __webpack_require__(19);

var _isHostObject2 = _interopRequireDefault(_isHostObject);

var _isObjectLike = __webpack_require__(20);

var _isObjectLike2 = _interopRequireDefault(_isObjectLike);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object,
 *  else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!(0, _isObjectLike2.default)(value) || objectToString.call(value) != objectTag || (0, _isHostObject2.default)(value)) {
    return false;
  }
  var proto = (0, _getPrototype2.default)(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

exports.default = isPlainObject;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetPrototype = Object.getPrototypeOf;

/**
 * Gets the `[[Prototype]]` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {null|Object} Returns the `[[Prototype]]`.
 */
function getPrototype(value) {
  return nativeGetPrototype(Object(value));
}

exports.default = getPrototype;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

exports.default = isHostObject;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
}

exports.default = isObjectLike;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = objectToMap;
/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/objecttomap
 */

/**
 * Transforms object to map.
 *
 *		const map = objectToMap( { 'foo': 1, 'bar': 2 } );
 *		map.get( 'foo' ); // 1
 *
 * @param {Object} obj Object to transform.
 * @returns {Map} Map created from object.
 */
function objectToMap(obj) {
  var map = new Map();

  for (var key in obj) {
    map.set(key, obj[key]);
  }

  return map;
}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ckeditor5Exports = __webpack_require__(1);

var _linkAttributeCommand = __webpack_require__(23);

var _linkAttributeCommand2 = _interopRequireDefault(_linkAttributeCommand);

var _removeAttributeCommand = __webpack_require__(26);

var _removeAttributeCommand2 = _interopRequireDefault(_removeAttributeCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var attributeName = 'data-signature';

var SignaturePlugin = function (_Plugin) {
  _inherits(SignaturePlugin, _Plugin);

  function SignaturePlugin() {
    _classCallCheck(this, SignaturePlugin);

    return _possibleConstructorReturn(this, (SignaturePlugin.__proto__ || Object.getPrototypeOf(SignaturePlugin)).apply(this, arguments));
  }

  _createClass(SignaturePlugin, [{
    key: "init",
    value: function init() {
      var editor = this.editor;
      editor.model.schema.extend("$text", {
        allowAttributes: [attributeName]
      });

      this.editor.commands.get("unlink").on("execute", function (evt, args) {
        editor.execute("removeSignature");
      });

      editor.conversion.for("downcast").attributeToElement({
        model: attributeName,
        view: function view(attributeValue, writer) {
          var linkElement = writer.createAttributeElement("a", attributeValue ? _defineProperty({}, attributeName, attributeValue) : {}, { priority: 5 });
          return linkElement;
        }
      });
      editor.conversion.for("upcast").elementToAttribute({
        view: {
          name: "a",
          attributes: _defineProperty({}, attributeName, true)
        },
        model: {
          key: attributeName,
          value: function value(viewElement) {
            return viewElement.getAttribute(attributeName);
          }
        }
      });

      editor.commands.add('signature', new _linkAttributeCommand2.default(this.editor, attributeName));
      editor.commands.add("removeSignature", new _removeAttributeCommand2.default(this.editor, attributeName));
    }
  }], [{
    key: "pluginName",
    get: function get() {
      return "Signature";
    }
  }]);

  return SignaturePlugin;
}(_ckeditor5Exports.Plugin);

exports.default = SignaturePlugin;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ckeditor5Exports = __webpack_require__(1);

var _findLinkRange = __webpack_require__(24);

var _findLinkRange2 = _interopRequireDefault(_findLinkRange);

var _toMap = __webpack_require__(25);

var _toMap2 = _interopRequireDefault(_toMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LinkAttributeCommand = function (_Command) {
  _inherits(LinkAttributeCommand, _Command);

  function LinkAttributeCommand(editor, attributeKey) {
    _classCallCheck(this, LinkAttributeCommand);

    var _this = _possibleConstructorReturn(this, (LinkAttributeCommand.__proto__ || Object.getPrototypeOf(LinkAttributeCommand)).call(this, editor));

    _this.attributeKey = attributeKey;
    return _this;
  }

  _createClass(LinkAttributeCommand, [{
    key: "refresh",
    value: function refresh() {
      var model = this.editor.model;
      var doc = model.document;

      this.value = doc.selection.getAttribute(this.attributeKey);
      this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, this.attributeKey);
    }
  }, {
    key: "execute",
    value: function execute(value) {
      var _this2 = this;

      var model = this.editor.model;
      var doc = model.document;
      var selection = doc.selection;
      var toggleMode = value === undefined;
      value = toggleMode ? !this.value : value;

      model.change(function (writer) {
        if (toggleMode && !value) {
          var rangesToUnset = selection.isCollapsed ? [(0, _findLinkRange2.default)(selection.getFirstPosition(), selection.getAttribute("linkHref"), model)] : selection.getRanges();
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = rangesToUnset[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var range = _step.value;

              writer.removeAttribute(_this2.attributeKey, range);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        } else if (selection.isCollapsed) {
          var position = selection.getFirstPosition();

          if (selection.hasAttribute("linkHref")) {
            var linkRange = (0, _findLinkRange2.default)(selection.getFirstPosition(), selection.getAttribute("linkHref"), model);
            if (value === false) {
              writer.removeAttribute(_this2.attributeKey, linkRange);
            } else {
              writer.setAttribute(_this2.attributeKey, value, linkRange);
              writer.setSelection(linkRange);
            }
          } else if (value !== "") {
            var attributes = (0, _toMap2.default)(selection.getAttributes());
            attributes.set(_this2.attributeKey, value);
            var node = writer.createText(value, attributes);
            writer.insert(node, position);
            writer.setSelection(Range.createOn(node));
          }
        } else {
          var ranges = model.schema.getValidRanges(selection.getRanges(), _this2.attributeKey);

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = ranges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _range = _step2.value;

              if (value === false) {
                writer.removeAttribute(_this2.attributeKey, _range);
              } else {
                writer.setAttribute(_this2.attributeKey, value, _range);
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      });
    }
  }]);

  return LinkAttributeCommand;
}(_ckeditor5Exports.Command);

exports.default = LinkAttributeCommand;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findLinkRange;
function findLinkRange(position, value, model) {
  return model.createRange(_findBound(position, value, true, model), _findBound(position, value, false, model));
}

function _findBound(position, value, lookBack, model) {
  var node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

  var lastNode = null;

  while (node && node.getAttribute("linkHref") == value) {
    lastNode = node;
    node = lookBack ? node.previousSibling : node.nextSibling;
  }

  return lastNode ? model.createPositionAt(lastNode, lookBack ? "before" : "after") : position;
}

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = objectToMap;
function objectToMap(obj) {
  var map = new Map();

  for (var key in obj) {
    map.set(key, obj[key]);
  }

  return map;
}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ckeditor5Exports = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _findRange(position, value, model, attributeKey) {
  return model.createRange(_findBound(position, value, true, model, attributeKey), _findBound(position, value, false, model, attributeKey));
}

function _findBound(position, value, lookBack, model, attributeKey) {
  var node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

  var lastNode = null;

  while (node && node.getAttribute(attributeKey) == value) {
    lastNode = node;
    node = lookBack ? node.previousSibling : node.nextSibling;
  }

  return lastNode ? model.createPositionAt(lastNode, lookBack ? "before" : "after") : position;
}

var RemoveAttributeCommand = function (_Command) {
  _inherits(RemoveAttributeCommand, _Command);

  function RemoveAttributeCommand(editor, attributeKey) {
    _classCallCheck(this, RemoveAttributeCommand);

    var _this = _possibleConstructorReturn(this, (RemoveAttributeCommand.__proto__ || Object.getPrototypeOf(RemoveAttributeCommand)).call(this, editor));

    _this.attributeKey = attributeKey;
    return _this;
  }

  _createClass(RemoveAttributeCommand, [{
    key: "refresh",
    value: function refresh() {
      var model = this.editor.model;
      var doc = model.document;

      this.value = doc.selection.getAttribute(this.attributeKey);
      this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, this.attributeKey);
    }
  }, {
    key: "execute",
    value: function execute(value) {
      var _this2 = this;

      var model = this.editor.model;
      var doc = model.document;
      var selection = doc.selection;
      var toggleMode = value === undefined;
      value = toggleMode ? !this.value : value;

      model.change(function (writer) {
        var rangesToUnset = selection.isCollapsed ? [_findRange(selection.getFirstPosition(), selection.getAttribute(_this2.attributeKey), model, _this2.attributeKey)] : selection.getRanges();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = rangesToUnset[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var range = _step.value;

            writer.removeAttribute(_this2.attributeKey, range);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
    }
  }]);

  return RemoveAttributeCommand;
}(_ckeditor5Exports.Command);

exports.default = RemoveAttributeCommand;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _class, _class2, _temp2, _dec3, _class3, _class4, _temp3;

var _react = __webpack_require__(3);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(4);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = __webpack_require__(5);

var _plowJs = __webpack_require__(2);

var _reactUiComponents = __webpack_require__(6);

var _neosUiDecorators = __webpack_require__(28);

var _neosUiCkeditor5Bindings = __webpack_require__(7);

var _neosUiReduxStore = __webpack_require__(8);

var _style = __webpack_require__(29);

var _style2 = _interopRequireDefault(_style);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ItempropButton = (_dec = (0, _reactRedux.connect)((0, _plowJs.$transform)({
    formattingUnderCursor: _neosUiReduxStore.selectors.UI.ContentCanvas.formattingUnderCursor
})), _dec2 = (0, _neosUiDecorators.neos)(function (globalRegistry) {
    return {
        i18nRegistry: globalRegistry.get('i18n')
    };
}), _dec(_class = _dec2(_class = (_temp2 = _class2 = function (_PureComponent) {
    _inherits(ItempropButton, _PureComponent);

    function ItempropButton() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ItempropButton);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ItempropButton.__proto__ || Object.getPrototypeOf(ItempropButton)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            isOpen: false
        }, _this.handleItempropButtonClick = function () {
            if (_this.isOpen()) {
                if ((0, _plowJs.$get)('itemprop', _this.props.formattingUnderCursor) !== undefined) {
                    (0, _neosUiCkeditor5Bindings.executeCommand)('itemprop');
                }
                _this.setState({ isOpen: false });
            } else {
                _this.setState({ isOpen: true });
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ItempropButton, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            // if new selection doesn't have itemprop, close the itemprop dialog
            if (!(0, _plowJs.$get)('itemprop', nextProps.formattingUnderCursor)) {
                this.setState({ isOpen: false });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                i18nRegistry = _props.i18nRegistry,
                formattingUnderCursor = _props.formattingUnderCursor,
                inlineEditorOptions = _props.inlineEditorOptions;


            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_reactUiComponents.IconButton, {
                    title: this.getItemprop() ? '' + i18nRegistry.translate('Psmb.Itemprop:Main:removeItemprop', 'Удалить itemprop') : '' + i18nRegistry.translate('Psmb.Itemprop:Main:insertItemprop', 'itemprop'),
                    isActive: this.isOpen(),
                    icon: this.getItemprop() ? 'ban' : 'bug',
                    onClick: this.handleItempropButtonClick
                }),
                this.isOpen() ? _react2.default.createElement(ItempropTextField, { itempropValue: this.getItemprop(), formattingUnderCursor: formattingUnderCursor, inlineEditorOptions: inlineEditorOptions }) : null
            );
        }
    }, {
        key: 'isOpen',
        value: function isOpen() {
            return Boolean(this.state.isOpen || this.getItemprop());
        }
    }, {
        key: 'getItemprop',
        value: function getItemprop() {
            return (0, _plowJs.$get)('itemprop', this.props.formattingUnderCursor) || '';
        }
    }]);

    return ItempropButton;
}(_react.PureComponent), _class2.propTypes = {
    formattingUnderCursor: _propTypes2.default.objectOf(_propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.bool, _propTypes2.default.string, _propTypes2.default.object])),
    inlineEditorOptions: _propTypes2.default.object,
    i18nRegistry: _propTypes2.default.object.isRequired
}, _temp2)) || _class) || _class);
exports.default = ItempropButton;
var ItempropTextField = (_dec3 = (0, _neosUiDecorators.neos)(function (globalRegistry) {
    return {
        i18nRegistry: globalRegistry.get('i18n')
    };
}), _dec3(_class3 = (_temp3 = _class4 = function (_PureComponent2) {
    _inherits(ItempropTextField, _PureComponent2);

    function ItempropTextField() {
        _classCallCheck(this, ItempropTextField);

        return _possibleConstructorReturn(this, (ItempropTextField.__proto__ || Object.getPrototypeOf(ItempropTextField)).apply(this, arguments));
    }

    _createClass(ItempropTextField, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: _style2.default.flyout },
                _react2.default.createElement(_reactUiComponents.TextInput, {
                    value: this.props.itempropValue,
                    autoFocus: true,
                    placeholder: this.props.i18nRegistry.translate('Psmb.Itemprop:Main:placeholder', 'Введите атрибут itemprop'),
                    onChange: function onChange(value) {
                        (0, _neosUiCkeditor5Bindings.executeCommand)('itemprop', value, false);
                    }
                })
            );
        }
    }]);

    return ItempropTextField;
}(_react.PureComponent), _class4.propTypes = {
    i18nRegistry: _propTypes2.default.object,
    itempropValue: _propTypes2.default.string,
    inlineEditorOptions: _propTypes2.default.object
}, _temp3)) || _class3);

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _readFromConsumerApi = __webpack_require__(0);

var _readFromConsumerApi2 = _interopRequireDefault(_readFromConsumerApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _readFromConsumerApi2.default)('NeosProjectPackages')().NeosUiDecorators;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(30);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(32)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {
	module.hot.accept("!!../node_modules/css-loader/index.js??ref--6-2!../node_modules/postcss-loader/lib/index.js??ref--6-3!./style.css", function() {
		var newContent = require("!!../node_modules/css-loader/index.js??ref--6-2!../node_modules/postcss-loader/lib/index.js??ref--6-3!./style.css");

		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(31)(false);
// imports


// module
exports.push([module.i, ".style__flyout___1vdkJ {\n    background-color: #222;\n    position: fixed;\n    z-index: 1;\n    width: 460px;\n    border: 8px solid #222;\n    top: 100px;\n}\n", ""]);

// exports
exports.locals = {
	"flyout": "style__flyout___1vdkJ"
};

/***/ }),
/* 31 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(33);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 33 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _class2, _temp;

var _react = __webpack_require__(3);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(4);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = __webpack_require__(5);

var _plowJs = __webpack_require__(2);

var _reactUiComponents = __webpack_require__(6);

var _neosUiCkeditor5Bindings = __webpack_require__(7);

var _neosUiReduxStore = __webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function makeid(length) {
  var result = '';
  var characters = 'abcdef0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

var LinkEditorOptions = (_dec = (0, _reactRedux.connect)((0, _plowJs.$transform)({
  formattingUnderCursor: _neosUiReduxStore.selectors.UI.ContentCanvas.formattingUnderCursor
})), _dec(_class = (_temp = _class2 = function (_PureComponent) {
  _inherits(LinkEditorOptions, _PureComponent);

  function LinkEditorOptions() {
    _classCallCheck(this, LinkEditorOptions);

    return _possibleConstructorReturn(this, (LinkEditorOptions.__proto__ || Object.getPrototypeOf(LinkEditorOptions)).apply(this, arguments));
  }

  _createClass(LinkEditorOptions, [{
    key: "render",
    value: function render() {
      var signature = null;
      var signatureJson = (0, _plowJs.$get)('signature', this.props.formattingUnderCursor);
      if (signatureJson) {
        try {
          signature = JSON.parse(signatureJson);
        } catch (e) {}
      }

      if (!signature) {
        return _react2.default.createElement(
          "div",
          { style: {
              flexBasis: '50%',
              padding: 8
            } },
          _react2.default.createElement(
            "div",
            null,
            _react2.default.createElement(
              _reactUiComponents.Button,
              { onClick: function onClick() {
                  (0, _neosUiCkeditor5Bindings.executeCommand)("signature", JSON.stringify({
                    signed: false,
                    signee: 'Копировский Александр Михайлович',
                    signeePosition: 'Ректор',
                    signDate: new Date(),
                    signKey: makeid(40)
                  }), false);
                } },
              "\u041F\u043E\u0434\u043F\u0438\u0441\u0430\u0442\u044C"
            )
          )
        );
      }

      var updateSignature = function updateSignature(key) {
        return function (value) {
          signature[key] = value;
          (0, _neosUiCkeditor5Bindings.executeCommand)("signature", JSON.stringify(signature), false);
        };
      };
      return _react2.default.createElement(
        "div",
        { style: {
            maxHeight: 450,
            overflow: 'auto',
            display: 'flex',
            flexWrap: 'wrap'
          } },
        _react2.default.createElement(
          "div",
          { style: {
              flexBasis: '50%',
              padding: 8
            } },
          _react2.default.createElement(
            "label",
            { className: { marginBottom: 4 }, htmlFor: "signee" },
            "\u0424\u0418\u041E \u043F\u043E\u0434\u043F\u0438\u0441\u0430\u0432\u0448\u0435\u0433\u043E \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442"
          ),
          _react2.default.createElement(
            "div",
            null,
            _react2.default.createElement(_reactUiComponents.TextInput, {
              id: "signee",
              value: signature.signee,
              placeholder: "ФИО подписавшего документ",
              onChange: updateSignature('signee')
            })
          )
        ),
        _react2.default.createElement(
          "div",
          { style: {
              flexBasis: '50%',
              padding: 8
            } },
          _react2.default.createElement(
            "label",
            { className: { marginBottom: 4 }, htmlFor: "signeePosition" },
            "\u0414\u043E\u043B\u0436\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u0434\u043F\u0438\u0441\u0430\u0432\u0448\u0435\u0433\u043E"
          ),
          _react2.default.createElement(
            "div",
            null,
            _react2.default.createElement(_reactUiComponents.TextInput, {
              id: "signeePosition",
              value: signature.signeePosition,
              placeholder: "ФИО подписавшего документ",
              onChange: updateSignature('signeePosition')
            })
          )
        ),
        _react2.default.createElement(
          "div",
          { style: {
              flexBasis: '50%',
              padding: 8
            } },
          _react2.default.createElement(
            "label",
            { className: { marginBottom: 4 }, htmlFor: "signDate" },
            "\u0414\u0430\u0442\u0430 \u043F\u043E\u0434\u043F\u0438\u0441\u0430\u043D\u0438\u044F"
          ),
          _react2.default.createElement(
            "div",
            null,
            _react2.default.createElement(_reactUiComponents.DateInput, {
              id: "signDate",
              value: signature.signDate,
              onChange: updateSignature('signDate')
            })
          )
        ),
        _react2.default.createElement(
          "div",
          { style: {
              flexBasis: '50%',
              padding: 8,
              marginTop: 20
            } },
          _react2.default.createElement(
            "div",
            null,
            _react2.default.createElement(
              _reactUiComponents.Button,
              { onClick: function onClick() {
                  (0, _neosUiCkeditor5Bindings.executeCommand)("removeSignature");
                } },
              "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u043E\u0434\u043F\u0438\u0441\u044C"
            )
          )
        )
      );
    }
  }]);

  return LinkEditorOptions;
}(_react.PureComponent), _class2.propTypes = {
  formattingUnderCursor: _propTypes2.default.object,
  linkingOptions: _propTypes2.default.object
}, _temp)) || _class);
exports.default = LinkEditorOptions;

/***/ })
/******/ ]);
//# sourceMappingURL=Plugin.js.map