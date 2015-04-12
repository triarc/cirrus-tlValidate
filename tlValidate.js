var mod = angular.module("tlValidate", []);
mod.directive('tlValidate', [
    '$translate',
    '$animate',
    '$compile',
    function ($translate, $animate, $compile) {
        return {
            restrict: 'E',
            scope: {
                target: '=',
                labelText: '=',
                contextHelp: '=',
                validationText: '=',
                validateNow: '=',
                explicit: '=',
                showRequired: '='
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
                        var el = $('<div />').addClass(cssValue).addClass("tooltip-placeholder");
                        var formGroup = $('<div class="form-group"/>');
                        var contextHelpDiv = $('<span>?</span>').addClass("badge").addClass("context-help");
                        contextHelpDiv.attr("popover-placement", helpPlacement);
                        contextHelpDiv.attr("popover-trigger", "mouseenter");
                        contextHelpDiv.hide();
                        if (isCheckbox) {
                            var label = $('<label class="control-label"/>').addClass(cssLabel);
                            label.append(contextHelpDiv);
                            var tooltipPlaceholder = $('<label />');
                            // center the validation error around the label for checkboxes
                            if (centerPlacement) {
                                formGroup.append(label);
                                var valueDiv = $('<label class="tooltip-placeholder control-label-text label-text"/>').text(scope.labelText);
                                valueDiv.append(iElement.children());
                                valueDiv.addClass(cssValue);
                                formGroup.append(valueDiv).appendTo(iElement);
                            }
                            else {
                                tooltipPlaceholder.addClass("tooltip-placeholder");
                                formGroup.append(label).append(tooltipPlaceholder.addClass(cssValue).append(iElement.children())).appendTo(iElement);
                                tooltipPlaceholder.append($("<text />").addClass("control-label-text label-text").text(scope.labelText));
                            }
                            validationRequiredSpan = $("<span class='validation-required'>&nbsp;*</span>");
                            validationRequiredSpan.hide();
                            label.prepend(validationRequiredSpan);
                            if (isRequired) {
                                validationRequiredSpan.show();
                            }
                        }
                        else {
                            var labelDiv = $('<label class="control-label"/>').addClass(cssLabel).append($("<span/>").addClass("control-label-text label-text").text(scope.labelText));
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
                        scope.$watch("contextHelp", function () {
                            var contextHelp = iElement.find(".context-help");
                            if (Triarc.hasValue(scope.contextHelp)) {
                                contextHelp.attr("popover", scope.contextHelp);
                                $compile(contextHelp)(scope);
                                contextHelp.show();
                            }
                            else {
                                contextHelp.hide();
                            }
                        });
                        // check if the language string is updated fro the label
                        scope.$watch("labelText", function () {
                            iElement.find(".control-label-text").text(scope.labelText);
                            //iElement.find("control-label-text").first().contents().filter(function () {
                            //        return this.nodeType == 3;
                            //    }).val('<span class="control-label-text" > ' + scope.labelText + ' </span >');
                        });
                        scope.$watch("target", function (newValue) {
                            scope.target = newValue;
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
                                    return $translate.instant('validator_' + err);
                                }
                            }
                            return '';
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
                                tempValEl.removeClass('in');
                                //$animate.addClass(validationElement, "out");
                                remove(tempValEl);
                            }
                        };
                        var showValidation = function () {
                            if (angular.isObject(validationElement)) {
                                hideValidation();
                            }
                            validationElement = $($.parseHTML('<div class="tooltip fade bottom" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner">' + getErrorName() + '</div></div>'));
                            var tooltipElement = getTooltipElement();
                            tooltipElement.after(validationElement);
                            setTimeout(function () {
                                validationElement.addClass('in');
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
                        scope.$watch('validateNow', function () {
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
                        scope.$watch('target.$error', function () {
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
mod.directive('tlRequiredAny', function () {
    function isEmpty(value) {
        return angular.isUndefined(value) || (angular.isArray(value) && value.length === 0) || value === '' || value === null || value !== value;
    }
    return {
        require: '?ngModel',
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
            attr.$observe('required', function () {
                validator(ctrl.$viewValue);
            });
        }
    };
});
mod.directive('tlOnlyNum', function () { return function (scope, element, attrs) {
    var keyCode = [8, 9, 37, 39, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110];
    element.bind("keydown", function (event) {
        console.log($.inArray(event.which, keyCode));
        if ($.inArray(event.which, keyCode) == -1) {
            scope.$apply(function () {
                scope.$eval(attrs.onlyNum);
                event.preventDefault();
            });
            event.preventDefault();
        }
    });
}; });
var INTEGER_REGEXP = /^\-?\d+$/;
mod.directive('tlSmartInteger', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (INTEGER_REGEXP.test(viewValue)) {
                    // it is valid
                    ctrl.$setValidity('integer', true);
                    return viewValue;
                }
                else {
                    // it is invalid, return undefined (no model update)
                    ctrl.$setValidity('integer', false);
                    return undefined;
                }
            });
        }
    };
});
mod.directive('tlSmartFloat', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                if (Triarc.validFloat(viewValue)) {
                    ctrl.$setValidity('float', true);
                    return parseFloat(viewValue.replace(',', '.'));
                }
                else {
                    ctrl.$setValidity('float', false);
                    return undefined;
                }
            });
        }
    };
});
mod.directive('tlPrice', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            if (!angular.isNumber(ctrl.$viewValue) || Triarc.hasNoValue(ctrl.$viewValue)) {
                ctrl.$setValidity('price', false);
            }
            ctrl.$parsers.unshift(function (viewValue) {
                if (Triarc.validFloat(viewValue)) {
                    ctrl.$setValidity('price', true);
                    return parseFloat(viewValue.replace(',', '.'));
                }
                else {
                    ctrl.$setValidity('price', false);
                    return undefined;
                }
            });
        }
    };
});
mod.directive('tlGreaterThanZero', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            if (!Triarc.validNumber(ctrl.$viewValue, 0)) {
                ctrl.$setValidity('greaterThanZero', false);
            }
            ctrl.$parsers.unshift(function (viewValue) {
                if (Triarc.validNumber(ctrl.$viewValue, 0)) {
                    ctrl.$setValidity('greaterThanZero', true);
                    return viewValue;
                }
                else {
                    ctrl.$setValidity('greaterThanZero', false);
                    return undefined;
                }
            });
        }
    };
});
mod.directive('tlAlphanumeric', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, elem, attr, ngModel) {
            var validator = function (value) {
                if (/^(?=.*[a-zA-Z])(?=.*[0-9]).+$/.test(value)) {
                    ngModel.$setValidity('alphanumeric', true);
                    return value;
                }
                else {
                    ngModel.$setValidity('alphanumeric', false);
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
