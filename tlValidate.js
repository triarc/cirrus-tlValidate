var mod = angular.module("tlValidate", []);
mod.directive("tlValidate", [
    "$translate", "$animate", "$compile", "$templateCache", function ($translate, $animate, $compile, $templateCache) {
        return {
            restrict: "E",
            scope: {
                target: "=",
                labelText: "&",
                contextHelp: "&",
                contextHelpAppendToBody: "&",
                validationText: "=",
                validateNow: "=",
                explicit: "=",
                showRequired: "=",
                clearValidationErrors: "=",
                labelTemplate: "&"
            },
            compile: function (elem, attr, transclude) {
                return {
                    pre: function (scope, iElement, attrs, controller) {
                    },
                    post: function (scope, iElement, attrs, controller) {
                        var cssLabel = "";
                        var cssValue = "";
                        var placement = "";
                        var centerPlacement = false;
                        var helpPlacement = "";
                        var validationText = null;
                        // non mandatory values
                        !Triarc.strNotEmpty(attrs.cssLabel) ? cssLabel = "col-sm-3" : cssLabel = attrs.cssLabel;
                        !Triarc.strNotEmpty(attrs.cssValue) ? cssValue = "col-sm-9" : cssValue = attrs.cssValue;
                        !Triarc.strNotEmpty(attrs.placement) ? placement = "bottom" : placement = attrs.placement;
                        !Triarc.strNotEmpty(attrs.centerPlacement) ? centerPlacement = false : centerPlacement = attrs.centerPlacement;
                        !Triarc.strNotEmpty(attrs.helpPlacement) ? helpPlacement = "left" : helpPlacement = attrs.helpPlacement;
                        !Triarc.strNotEmpty(scope.validationText) ? validationText = null : validationText = scope.validationText;
                        var isRequired = false;
                        iElement.find("[required],[required-any]").each(function (index, child) {
                            isRequired = true;
                        });
                        var element = iElement.children().first();
                        var isCheckbox = element.attr("type") == "checkbox";
                        var validationRequiredSpan;
                        // todo configurable
                        var el = $("<div />").addClass(cssValue).addClass("tooltip-placeholder");
                        var formGroup = $("<div class=\"form-group\"/>");
                        var contextHelpDiv = $("<span>?</span>").addClass("badge").addClass("context-help");
                        contextHelpDiv.attr("popover-placement", helpPlacement);
                        contextHelpDiv.attr("popover-trigger", "mouseenter");
                        contextHelpDiv.hide();
                        if (isCheckbox) {
                            var label = $("<label class=\"control-label\"/>").addClass(cssLabel);
                            label.append(contextHelpDiv);
                            var tooltipPlaceholder = $("<label />");
                            // center the validation error around the label for checkboxes
                            if (centerPlacement) {
                                formGroup.append(label);
                                var valueDiv = $("<label class=\"tooltip-placeholder control-label-text label-text\"/>");
                                valueDiv.append(iElement.children());
                                valueDiv.addClass(cssValue);
                                formGroup.append(valueDiv).appendTo(iElement);
                            }
                            else {
                                tooltipPlaceholder.addClass("tooltip-placeholder");
                                formGroup.append(label).append(tooltipPlaceholder.addClass(cssValue).append(iElement.children())).appendTo(iElement);
                                tooltipPlaceholder.append($("<text />").addClass("control-label-text label-text"));
                            }
                            validationRequiredSpan = $("<span class='validation-required'>&nbsp;*</span>");
                            validationRequiredSpan.hide();
                            label.prepend(validationRequiredSpan);
                            if (isRequired) {
                                validationRequiredSpan.show();
                            }
                        }
                        else {
                            var labelDiv = $("<label class=\"control-label\"/>").addClass(cssLabel).append($("<span/>").addClass("control-label-text label-text"));
                            formGroup.append(labelDiv);
                            validationRequiredSpan = $("<span class='validation-required'>&nbsp;*</span>");
                            validationRequiredSpan.hide();
                            labelDiv.append(validationRequiredSpan);
                            if (isRequired) {
                                validationRequiredSpan.show();
                            }
                            labelDiv.append(contextHelpDiv);
                            formGroup.append(el.append(iElement.children())).appendTo(iElement);
                        }
                        scope.$watch("contextHelp()", function () {
                            var contextHelp = iElement.find(".context-help");
                            var label = iElement.find(".control-label-text");
                            if (Triarc.strNotEmpty(scope.contextHelp())) {
                                if (attrs.hasOwnProperty("tlContextHelpBadge")) {
                                    contextHelp.attr("popover", scope.contextHelp());
                                    $compile(contextHelp)(scope);
                                    contextHelp.show();
                                }
                                if (attrs.hasOwnProperty("tlContextHelpLink")) {
                                    label.attr("popover", scope.contextHelp())
                                        .attr("popover-trigger", "mouseenter")
                                        .attr("popover-append-to-body", (scope.contextHelpAppendToBody() || false).toString())
                                        .attr("popover-placement", helpPlacement)
                                        .addClass("lablel-with-help");
                                    $compile(label)(scope);
                                }
                            }
                            else {
                                contextHelp.hide();
                                label.removeAttr("popover")
                                    .removeAttr("popover-append-to-body")
                                    .removeAttr("popover-trigger")
                                    .removeClass("lablel-with-help");
                                $compile(label)(scope);
                            }
                        });
                        // check if the language string is updated fro the label
                        scope.$watchGroup(["labelText()", "labelTemplate()"], function () {
                            var template = scope.labelTemplate();
                            var labelElement = iElement.find(".control-label-text");
                            if (angular.isString(template)) {
                                var template = $templateCache.get(template);
                                $compile(template)(scope.$parent.$parent).appendTo(labelElement);
                            }
                            else {
                                labelElement.text(scope.labelText());
                            }
                        });
                        scope.$watch("showRequired", function () {
                            if (scope.showRequired || isRequired) {
                                validationRequiredSpan.show();
                            }
                            else {
                                validationRequiredSpan.hide();
                                hideValidation();
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
                            if (angular.isString(validationText)) {
                                return validationText;
                            }
                            for (var err in scope.target.$error) {
                                if (scope.target.$error[err] == true) {
                                    return $translate.instant("validator_" + err);
                                }
                            }
                            return "";
                        };
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
                        var showValidation = function () {
                            if (angular.isObject(validationElement)) {
                                hideValidation();
                            }
                            validationElement = $($.parseHTML("<div class=\"tooltip fade bottom\" role=\"tooltip\">" +
                                "<div class=\"tooltip-arrow\"></div>" +
                                "<div class=\"tooltip-inner\">"
                                + getErrorName() + "</div></div>"));
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
                            if (scope.target && scope.target.$invalid == true) {
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
                                if (scope.explicit == true) {
                                    scope.validateNow = false;
                                }
                            }
                        });
                        // observing the error flag on the form when the element has been updated and is then invalid
                        scope.$watch("target.$error", function () {
                            if (!scope.target) {
                                // hidden form elements 
                                return;
                            }
                            if (scope.explicit == true) {
                            }
                            else {
                                if (angular.isObject(scope.target) && scope.target.$invalid == true && scope.target.$dirty) {
                                    scope.validateElement();
                                }
                                else if (scope.target.$valid) {
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
var INTEGER_REGEXP = /^\-?\d+$/;
mod.directive("tlSmartInteger", function () {
    return {
        require: "ngModel",
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (value) {
                if (Triarc.strIsEmpty(value)) {
                    ctrl.$setValidity("integer", true);
                    return undefined;
                }
                if (INTEGER_REGEXP.test(value)) {
                    // it is valid
                    ctrl.$setValidity("integer", true);
                    return value;
                }
                else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity("integer", false);
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
            if (!Triarc.validFloat(ctrl.$viewValue) && Triarc.strNotEmpty(ctrl.$viewValue)) {
                ctrl.$setValidity("float", false);
            }
            ctrl.$parsers.unshift(function (value) {
                if (Triarc.strIsEmpty(value)) {
                    ctrl.$setValidity("float", true);
                    return undefined;
                }
                if (Triarc.validFloat(value)) {
                    ctrl.$setValidity("float", true);
                    return parseFloat(value.replace(",", "."));
                }
                else {
                    ctrl.$setValidity("float", false);
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

