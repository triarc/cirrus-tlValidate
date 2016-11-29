var mod = angular.module("tlValidate", []);
mod.directive("tlValidate", [
    "$translate", "$animate", "$compile", "$templateCache", function ($translate, $animate, $compile, $templateCache) {
        return {
            restrict: "E",
            scope: {
                target: "&",
                labelText: "&",
                contextHelp: "&",
                contextHelpAppendToBody: "&",
                contextHelpTemplate: "&",
                validationText: "&",
                validateNow: "=",
                explicit: "&",
                showRequired: "&",
                clearValidationErrors: "=",
                labelTemplate: "&"
            },
            compile: function () {
                return {
                    post: function (scope, iElement, attrs) {
                        var cssLabel = "";
                        var cssValue = "";
                        var placement = "";
                        var centerPlacement = false;
                        var helpPlacement = "";
                        // non mandatory values
                        !Triarc.strNotEmpty(attrs.cssLabel) ? cssLabel = "col-sm-3" : cssLabel = attrs.cssLabel;
                        !Triarc.strNotEmpty(attrs.cssValue) ? cssValue = "col-sm-9" : cssValue = attrs.cssValue;
                        !Triarc.strNotEmpty(attrs.placement) ? placement = "bottom" : placement = attrs.placement;
                        !Triarc.strNotEmpty(attrs.centerPlacement) ? centerPlacement = false : centerPlacement = attrs.centerPlacement;
                        !Triarc.strNotEmpty(attrs.helpPlacement) ? helpPlacement = "left" : helpPlacement = attrs.helpPlacement;
                        var isRequired = false;
                        iElement.find("[required],[required-any]").each(function () {
                            isRequired = true;
                        });
                        var element = iElement.children().first();
                        var isCheckbox = element.attr("type") === "checkbox";
                        // todo configurable
                        var el = $(document.createElement('div')).addClass(cssValue).addClass("tooltip-placeholder");
                        var formGroup = $(document.createElement('div')).addClass('form-group');
                        var label;
                        if (isCheckbox) {
                            label = $(document.createElement('label')).addClass('control-label').addClass(cssLabel);
                            var tooltipPlaceholder = $(document.createElement('label'));
                            // center the validation error around the label for checkboxes
                            if (centerPlacement) {
                                formGroup.append(label);
                                var valueDiv = $(document.createElement('label'))
                                    .addClass('tooltip-placeholder')
                                    .addClass('control-label-text')
                                    .addClass('label-text');
                                valueDiv.append(iElement.children());
                                valueDiv.addClass(cssValue);
                                formGroup.append(valueDiv).appendTo(iElement);
                            }
                            else {
                                tooltipPlaceholder.addClass("tooltip-placeholder");
                                formGroup.append(label).append(tooltipPlaceholder.addClass(cssValue).append(iElement.children())).appendTo(iElement);
                                tooltipPlaceholder.append($(document.createElement('text')).addClass("control-label-text label-text"));
                            }
                        }
                        else {
                            label = $(document.createElement('label')).addClass("control-label").addClass(cssLabel);
                            $(document.createElement("span"))
                                .addClass("control-label-text label-text").appendTo(label);
                            formGroup.append(label);
                            formGroup.append(el.append(iElement.children())).appendTo(iElement);
                        }
                        scope.$watch("contextHelp()", function (newValue) {
                            var labelText = label.find('.control-label-text');
                            var contextHelp = iElement.find(".context-help");
                            var helpText = newValue;
                            if (Triarc.strNotEmpty(helpText)) {
                                if (contextHelp.length === 0 && attrs.hasOwnProperty("tlContextHelpBadge")) {
                                    contextHelp = $("<span>?</span>").addClass("badge").addClass("context-help");
                                    contextHelp.attr("popover-placement", helpPlacement);
                                    contextHelp.attr("popover-trigger", "mouseenter");
                                    labelText.append(contextHelp);
                                    contextHelp.attr("popover", helpText);
                                    $compile(contextHelp)(scope);
                                    contextHelp.show();
                                }
                                if (attrs.hasOwnProperty("tlContextHelpLink")) {
                                    labelText.attr("popover-trigger", "mouseenter")
                                        .attr("popover-append-to-body", (scope.contextHelpAppendToBody() || false).toString())
                                        .attr("popover-placement", helpPlacement)
                                        .addClass("lablel-with-help");
                                    var templateName = scope.contextHelpTemplate();
                                    if (Triarc.strNotEmpty(templateName)) {
                                        labelText.attr("popover-template", "'" + templateName + "'");
                                        scope.$toolTip = helpText;
                                    }
                                    else {
                                        labelText.attr("popover", helpText);
                                    }
                                    $compile(labelText)(scope);
                                }
                            }
                            else if (contextHelp.length > 0) {
                                contextHelp.remove();
                                labelText.removeAttr("popover")
                                    .removeAttr("popover-template")
                                    .removeAttr("popover-append-to-body")
                                    .removeAttr("popover-trigger")
                                    .removeClass("lablel-with-help");
                                $compile(labelText)(scope);
                            }
                        });
                        // check if the language string is updated fro the label
                        scope.$watchGroup(["labelText()", "labelTemplate()"], function () {
                            var template = scope.labelTemplate();
                            var labelElement = iElement.find(".control-label-text");
                            if (angular.isString(template)) {
                                template = $templateCache.get(template);
                                $compile(template)(scope.$parent.$parent).appendTo(labelElement);
                            }
                            else {
                                labelElement.text(scope.labelText());
                            }
                        });
                        var validationElement;
                        var remove = function (valEl) {
                            if (angular.isObject(valEl)) {
                                valEl.remove();
                            }
                        };
                        var hideValidation = function () {
                            if (angular.isObject(validationElement)) {
                                var tempValEl = validationElement;
                                tempValEl.removeClass("in");
                                //$animate.addClass(validationElement, "out");
                                remove(tempValEl);
                            }
                        };
                        var validationRequiredSpan;
                        scope.$watch("showRequired()", function (showRequired) {
                            if ((showRequired || isRequired) && !angular.isObject(validationRequiredSpan)) {
                                validationRequiredSpan = $(document.createElement('span')).addClass('validation-required').html('&nbsp;*');
                                label.append(validationRequiredSpan);
                            }
                            else if (angular.isObject(validationRequiredSpan)) {
                                validationRequiredSpan.remove();
                                validationRequiredSpan = null;
                            }
                        });
                        scope.$watch("clearValidationErrors", function () {
                            if (scope.clearValidationErrors) {
                                hideValidation();
                                scope.clearValidationErrors = false;
                            }
                        });
                        var getTooltipElement = (function () {
                            // assign where to put the validation error
                            // normal elements
                            if (!isCheckbox) {
                                return formGroup.find(".tooltip-placeholder").last().children().last();
                            }
                            else if (isCheckbox && centerPlacement) {
                                return formGroup.find(".tooltip-placeholder").children().last();
                            }
                            else {
                                return formGroup.find("text").first();
                            }
                        });
                        var getErrorName = function () {
                            var text = scope.validationText();
                            if (angular.isString(text)) {
                                return text;
                            }
                            var formController = scope.target();
                            for (var err in formController.$error) {
                                if (formController.$error[err] === true) {
                                    return $translate.instant("validator_" + err);
                                }
                            }
                            return "";
                        };
                        var showValidation = function () {
                            if (angular.isObject(validationElement)) {
                                hideValidation();
                            }
                            validationElement = $(document.createElement('div'))
                                .addClass('tooltip fade bottom')
                                .attr('role', 'tooltip');
                            $(document.createElement('div'))
                                .addClass('tooltip-arrow')
                                .appendTo(validationElement);
                            $(document.createElement('div'))
                                .addClass('tooltip-inner')
                                .html(getErrorName())
                                .appendTo(validationElement);
                            var tooltipElement = getTooltipElement();
                            tooltipElement.after(validationElement);
                            setTimeout(function () {
                                validationElement.addClass("in");
                            });
                            tooltipElement.bind("destroy", function () {
                                hideValidation();
                            });
                        };
                        // validate the element and set validation error messages
                        scope.validateElement = (function () {
                            var formController = scope.target();
                            if (formController && formController.$invalid === true) {
                                showValidation();
                            }
                            else {
                                hideValidation();
                            }
                        });
                        // manual trigger for the validation
                        scope.$watch("validateNow", function () {
                            if (scope.validateNow) {
                                scope.validateElement();
                                // when explicit is set, always reset the validate now so
                                // it can be reset explicitely
                                if (scope.explicit() === true) {
                                    scope.validateNow = false;
                                }
                            }
                        });
                        // observing the error flag on the form when the element has been updated and is then invalid
                        scope.$watch("target().$error", function () {
                            var formController = scope.target();
                            if (!formController) {
                                // hidden form elements 
                                return;
                            }
                            if (scope.explicit() === true) {
                            }
                            else {
                                if (angular.isObject(formController) && formController.$invalid === true && formController.$dirty) {
                                    scope.validateElement();
                                }
                                else if (formController.$valid) {
                                    hideValidation();
                                }
                            }
                        }, true);
                    }
                };
            }
        };
    }
]);
mod.directive("tlRequiredAny", function () {
    function isEmpty(value) {
        return angular.isUndefined(value) || (angular.isArray(value) && value.length === 0) || value === "" || value === null;
    }
    return {
        require: "?ngModel",
        link: function (scope, elm, attr, ctrl) {
            if (!ctrl)
                return;
            var validator = function (value) {
                if (isEmpty(value) || value === false) {
                    return false;
                }
                else {
                    return true;
                }
            };
            //ctrl.$formatters.push(validator);
            //ctrl.$parsers.unshift(validator);
            ctrl.$validators["requiredAny"] = validator;
            attr.$observe("required", function () {
                validator(ctrl.$viewValue);
            });
        }
    };
});
mod.directive("tlOnlyNum", function () {
    return {
        require: "ngModel",
        restrict: "A",
        link: function (scope, element, attr, ctrl) {
            ctrl.$parsers.push(function (val) {
                if (angular.isString(val)) {
                    var digits = val.replace(/[^0-9.,]/g, "");
                    if (digits !== val) {
                        ctrl.$setViewValue(digits);
                        ctrl.$render();
                    }
                    return parseFloat(digits);
                }
                if (angular.isNumber(val)) {
                    return val;
                }
                return undefined;
            });
        }
    };
});
//Put this directive on a field, where the user is required to input a regex string
mod.directive("tlRegexInput", function () {
    var testRegexValidity = function (str) {
        try {
            var regex = new RegExp(str);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    return {
        require: "ngModel",
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (value) {
                if (Triarc.strIsEmpty(value)) {
                    return null;
                }
                if (testRegexValidity(value)) {
                    ctrl.$setValidity("regex", true);
                    return value;
                }
                else {
                    ctrl.$setValidity("regex", false);
                    return undefined;
                }
            });
            ctrl.$formatters.push(function (value) {
                if (Triarc.strNotEmpty(value)) {
                    ctrl.$setValidity("regex", testRegexValidity(value));
                }
                return value;
            });
        }
    };
});
var INTEGER_REGEXP = /^\-?\d+$/;
mod.directive("tlSmartInteger", function () {
    return {
        require: "ngModel",
        link: function (scope, elm, attrs, ctrl) {
            var min = parseInt(attrs['min']);
            var max = parseInt(attrs['max']);
            ctrl.$parsers.unshift(function (value) {
                if (Triarc.strIsEmpty(value)) {
                    ctrl.$setValidity("integer", true);
                    ctrl.$setValidity("min", true);
                    ctrl.$setValidity("max", true);
                    return null;
                }
                if (INTEGER_REGEXP.test(value)) {
                    // it is valid
                    ctrl.$setValidity("integer", true);
                    if (!isNaN(min) && parseInt(value) < min) {
                        ctrl.$setValidity("min", false);
                    }
                    else {
                        ctrl.$setValidity("min", true);
                    }
                    if (!isNaN(max) && parseInt(value) > max) {
                        ctrl.$setValidity("max", false);
                    }
                    else {
                        ctrl.$setValidity("max", true);
                    }
                    return value;
                }
                else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity("integer", false);
                    ctrl.$setValidity("min", true);
                    ctrl.$setValidity("max", true);
                    return undefined;
                }
            });
            ctrl.$formatters.push(function (value) {
                if (Triarc.strNotEmpty(value)) {
                    ctrl.$setValidity("integer", INTEGER_REGEXP.test(value));
                }
                return value;
            });
        }
    };
});
mod.directive("tlSmartFloat", function () {
    return {
        require: "ngModel",
        link: function (scope, elm, attrs, ctrl) {
            var min = parseFloat(attrs['min']);
            var max = parseFloat(attrs['max']);
            if (!Triarc.validFloat(ctrl.$viewValue) && Triarc.strNotEmpty(ctrl.$viewValue)) {
                ctrl.$setValidity("float", false);
            }
            ctrl.$parsers.unshift(function (value) {
                if (Triarc.strIsEmpty(value)) {
                    ctrl.$setValidity("float", true);
                    ctrl.$setValidity("min", true);
                    ctrl.$setValidity("max", true);
                    return null;
                }
                if (Triarc.validFloat(value)) {
                    ctrl.$setValidity("float", true);
                    var parsedValue = parseFloat(value.replace(",", "."));
                    if (!isNaN(min) && parsedValue < min) {
                        ctrl.$setValidity("min", false);
                    }
                    else {
                        ctrl.$setValidity("min", true);
                    }
                    if (!isNaN(max) && parsedValue > max) {
                        ctrl.$setValidity("max", false);
                    }
                    else {
                        ctrl.$setValidity("max", true);
                    }
                    return parsedValue;
                }
                else {
                    ctrl.$setValidity("float", false);
                    ctrl.$setValidity("min", true);
                    ctrl.$setValidity("max", true);
                    return undefined;
                }
            });
            ctrl.$formatters.push(function (value) {
                if (Triarc.strNotEmpty(value)) {
                    ctrl.$setValidity("float", Triarc.validFloat(value));
                }
                return value;
            });
        }
    };
});
mod.directive("tlPrice", function () {
    return {
        require: "ngModel",
        link: function (scope, elm, attrs, ctrl) {
            if (!angular.isNumber(ctrl.$viewValue)) {
                ctrl.$setValidity("price", false);
            }
            ctrl.$parsers.unshift(function (viewValue) {
                if (Triarc.validFloat(viewValue)) {
                    ctrl.$setValidity("price", true);
                    return parseFloat(viewValue.replace(",", "."));
                }
                else {
                    ctrl.$setValidity("price", false);
                    return undefined;
                }
            });
            ctrl.$formatters.push(function (value) {
                ctrl.$setValidity("price", angular.isNumber(ctrl.$viewValue));
                return value;
            });
        }
    };
});
mod.directive("tlGreaterThanZero", function () {
    return {
        require: "ngModel",
        link: function (scope, elm, attrs, ctrl) {
            if (!Triarc.validNumber(ctrl.$viewValue, 0)) {
                ctrl.$setValidity("greaterThanZero", false);
            }
            ctrl.$parsers.unshift(function (viewValue) {
                if (Triarc.validNumber(ctrl.$viewValue, 0)) {
                    ctrl.$setValidity("greaterThanZero", true);
                    return viewValue;
                }
                else {
                    ctrl.$setValidity("greaterThanZero", false);
                    return undefined;
                }
            });
        }
    };
});
mod.directive("tlAlphanumeric", function () {
    return {
        require: "ngModel",
        restrict: "A",
        link: function (scope, elem, attr, ngModel) {
            var validator = function (value) {
                if (/^(?=.*[a-zA-Z])(?=.*[0-9]).+$/.test(value)) {
                    ngModel.$setValidity("alphanumeric", true);
                    return value;
                }
                else {
                    ngModel.$setValidity("alphanumeric", false);
                    return undefined;
                }
            };
            //For DOM -> model validation
            ngModel.$parsers.unshift(validator);
            //For model -> DOM validation
            ngModel.$formatters.unshift(validator);
        }
    };
});

