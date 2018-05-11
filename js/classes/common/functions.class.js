;
(function(name, context, factory) {
    // Supports UMD. AMD, CommonJS/Node.js and browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})("commonFunc", this, function() {
    'use strict';
    var paddingMark = function(value, mark, length, paddingLeft) {
        var paddingLength = length - value.toString().length;
        var markContext = '';
        for (var i = 0; i < paddingLength; i++) markContext += mark;
        if (paddingLeft) return (markContext + value.toString());
        else return (value.toString() + markContext);
    };
    var traverseClearEvent = function(childrens) {
        childrens.each(function(i, n) {
            var ele = $(n);
            ele.off('click');
            ele.off('change');
            if (ele.children().length) traverseClearEvent(ele.children());
        });
    };
    var factory = {
        _mergeObject: function() {
            var merged = {};
            var argsLen = arguments.length;
            for (var i = 0; i < argsLen; i++) {
                var obj = arguments[i];
                for (var key in obj) {
                    merged[key] = obj[key];
                }
            }
            return merged;
        },
        _isArray: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        _chkEqual: function(a, b) {
            try {
                return (a.toString().trim() === b.toString().trim());
            } catch (e) {
                console.log(e.message);
                return false;
            }
        },
        _toInt: function(data) {
            try {
                return parseInt(data);
            } catch (e) {
                console.log(e.message);
                return 0;
            }
        },
        _toFloat: function(data) {
            try {
                return parseFloat(data);
            } catch (e) {
                console.log(e.message);
                return 0;
            }
        },
        _binary2Int: function(data) {
            try {
                return parseInt(data, 2);
            } catch (e) {
                console.log(e.message);
                return -1;
            }
        },
        _hex2char: function(data) {
            var a = data.toString().trim();
            switch (a.length) {
                case 1:
                    a = '%u000' + a;
                    break;
                case 2:
                    a = '%u00' + a;
                    break;
                case 3:
                    a = '%u0' + a;
                    break;
                case 4:
                    a = '%u' + a;
                    break;
                default:
                    break;
            }
            return unescape(a);
        },
        _paddingMark: function(value, mark, length, paddingLeft) {
            return paddingMark(value, mark, length, paddingLeft);
        },
        _getHypotenuse: function(edgeA, edgeB) {
            return Math.sqrt(Math.pow(edgeA, 2) + Math.pow(edgeB, 2));
        },
        _getRandom: function(from, to) {
            var c = from - to + 1;
            return Math.floor(Math.random() * c + to);
        },
        _getQuarter: function(start, end) {
            return Math.ceil((end - start) / 4);
        },
        _randomSort: function(arr) {
            arr.sort(function(a, b) {
                return Math.random() - Math.random();
            });
        },
        _translatePtoArea: function(num, radius, isRealPoint) {
            //if (num === 0) return 0;
            if (isRealPoint) return (num * radius);
            return (num * radius + radius / 2);
        },
        _registerListener: function(container, func) {
            if (typeof func !== 'function' || !this._isArray(container)) return;
            var i = 0;
            for (i; i < container.length; i++) {
                if (container[i] === func) break;
            }
            if (i < container.length) return;
            container.push(func);
        },
        _unRegisterListener: function(container, func) {
            if (typeof func !== 'function' || !this._isArray(container)) return;
            var i = 0;
            for (i; i < container.length; i++) {
                if (container[i] === func) break;
            }
            if (i < container.length) container.splice(i, 1);
        },
        _traverseClearEvent: function(childrens) {
            traverseClearEvent(childrens);
        },

        _getShownDifferentTime: function(nowDate, timestamp) {
            var showTime = nowDate.getDiff(timestamp);
            var contextTime = '';
            //if (showTime.d) contextTime += showTime.d + 'd';
            switch (true) {
                case (showTime.h !== undefined && showTime.h > 0):
                    contextTime += paddingMark(showTime.h, '0', 2, true) + ':';
                    if (showTime.m !== undefined && showTime.m > 0)
                        contextTime += paddingMark(showTime.m, '0', 2, true);
                    else contextTime += '00';
                    break;
                case (showTime.m !== undefined && showTime.m > 0):
                    contextTime += paddingMark(showTime.m, '0', 2, true) + '\'';
                    if (showTime.s !== undefined && showTime.s > 0)
                        contextTime += paddingMark(showTime.s, '0', 2, true) + '\"';
                    else contextTime += '00\"';
                    break;
                case (showTime.s !== undefined && showTime.s > 0):
                    contextTime += paddingMark(showTime.s, '0', 2, true) + '\"';
                    break;
                default:
                    break;
            }
            return contextTime;
        },
        _getBinaryImage: function(imgData, width) {
            var inner = [];
            var row = [];
            for (var i = 0; i < imgData.length; i += 4) {
                if (imgData[i] === null) continue;
                if (imgData[i + 3] > 20) row.push(1);
                else row.push(0);
                if (row.length === width) {
                    inner.push(row.slice(0));
                    row.length = 0;
                }
            }
            return inner;
        },
        _getJson: function(path) {
            var json = null;
            $.ajaxSettings.async = false;
            $.getJSON(path, function(result) {
                json = result;
            });
            $.ajaxSettings.async = true;
            return json;
        }
    };
    return factory;
});