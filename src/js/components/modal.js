(function() {
    'use strict';
    //TODO:Anton Nesterenko: create commons library
    var random = function(qty, symbols) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        if (symbols !== null && symbols !== undefined) {
            possible = symbols;
        }
        if (qty === undefined || qty === null) {
            qty = 4;
        }
        for (var i = 0; i < qty; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    };

    var DEFAULTS = {
        overlayId: 'modal.overlay.template',
        templateId: 'modal.body.template',
        templateUrl: undefined,
        template: undefined,
        dialogTemplateId: 'modal.dialog.template',
        dialogTemplateUrl: undefined,
        dialogTemplate: undefined,
        closeBtnClass: 'modal-dialog-close',
        dialogBodyClass: 'dialog-body',
        overlayVisibilityClass: 'overlay-visible',
        scope: undefined,
        controller: undefined,
        controllerAs: undefined
    };

    var mergeOptions = function(opts) {
        opts.template = opts.template || DEFAULTS.template;
        opts.templateId = opts.templateId || DEFAULTS.templateId;
        opts.templateUrl = opts.templateUrl || DEFAULTS.templateUrl;
        opts.dialogTemplate = opts.dialogTemplate || DEFAULTS.dialogTemplate;
        opts.dialogTemplateId = opts.dialogTemplateId || DEFAULTS.dialogTemplateId;
        opts.dialogTemplateUrl = opts.dialogTemplateUrl || DEFAULTS.dialogTemplateUrl;
        opts.closeBtnClass = opts.closeBtnClass || DEFAULTS.closeBtnClass;
        opts.dialogBodyClass = opts.dialogBodyClass || DEFAULTS.dialogBodyClass;
        opts.overlayVisibilityClass = opts.overlayVisibilityClass || DEFAULTS.overlayVisibilityClass;
        return opts;
    };

    var resolveTemplate = function($log, $http, $q, $templateCache, id, url, content) {
        var templateDefer = $q.defer();

        var defaultTemplate = $templateCache.get(DEFAULTS.templateId);
        if (url) {
            $http.get(url)
                .success(function(html) {
                    templateDefer.resolve(html);
                })
                .error(function() {
                    $log.error('Cannot load template by url %s. Falling back to default template', url);
                    templateDefer.resolve(defaultTemplate);
                });
        } else if (content) {
            templateDefer.resolve(content);
        } else {
            templateDefer.resolve($templateCache.get(id));
        }
        return templateDefer.promise;
    };

    angular
        .module('chr.modal', [])
        .provider('$modal', function() {
            this.configureDefaults = function(opts) {
                DEFAULTS = mergeOptions(opts);
            };
            this.$get = function($log, $templateCache, $timeout, $compile, $document, $http, $q, $animate, $controller,
                                 $rootScope) {
                var bodyEl = $document.find('body');
                var overlayEl = angular.element($templateCache.get(DEFAULTS.overlayId));
                bodyEl.prepend(overlayEl);
                var createDialogElement = function(opts, html, dialogHtml) {
                    if (html.indexOf(opts.dialogBodyClass) === -1) {
                        throw new EvalError('Cannot create template without ' + opts.dialogBodyClass + ' class');
                    }
                    var windowTemplate = angular.element(html);
                    var bodyContainer;
                    if (windowTemplate.hasClass(opts.dialogBodyClass)) {
                        bodyContainer = windowTemplate[0];
                    } else {
                        bodyContainer = windowTemplate[0].querySelector('.' + opts.dialogBodyClass);
                    }
                    if (bodyContainer) {
                        bodyContainer.innerHTML = dialogHtml;
                    }
                    windowTemplate.attr('id', random(10));
                    return windowTemplate;
                };
                var openDialog = function(options) {
                    var opts = mergeOptions(options);
                    var scope = angular.isObject(opts.scope) ? opts.scope.$new() : $rootScope.$new();

                    var ctrl = options.controller;
                    var ctrlLocals = {};
                    ctrlLocals.$scope = scope;
                    if (ctrl) {
                        var ctrlInstance = $controller(ctrl, ctrlLocals);
                        scope.ctrl = ctrlInstance;
                        if (options.controllerAs) {
                            scope[options.controllerAs] = ctrlInstance;
                        }
                    }
                    var templatePromise = resolveTemplate($log, $http, $q, $templateCache,
                        opts.templateId, opts.templateUrl, opts.template);
                    var dialogTemplatePromise = resolveTemplate($log, $http, $q, $templateCache,
                        opts.dialogTemplateId, opts.dialogTemplateUrl, opts.dialogTemplate);
                    return $q.all([templatePromise, dialogTemplatePromise]).then(function(arr) {
                        var el = createDialogElement(opts, arr[0], arr[1]);
                        $compile(el)(scope);
                        overlayEl.append(el);
                        overlayEl.addClass(opts.overlayVisibilityClass);

                        var modal = {
                            el: el,
                            opts: opts,
                            scope: scope
                        };
                        var closeButtonEl = angular.element(el[0].querySelectorAll('.' + opts.closeBtnClass));
                        closeButtonEl.on('click touchend', function(e) {
                            closeDialog(modal);
                        });
                        return modal;
                    }, function(e) {
                        $log.error('Error occurred during modal rendering', e);
                        throw e;
                    });
                };

                var closeDialog = function(modal) {
                    $q.when(modal, function(m) {
                        overlayEl.removeClass(m.opts.overlayVisibilityClass);
                        m.el.remove();
                        m.scope.$destroy();
                        delete m.el;
                        delete m.scope;
                        delete m.opts;
                    });
                };
                return {
                    open: openDialog,
                    close: closeDialog
                };
            };
        }).animation('.chr-modal-show', function() {
            return {
                animate: function(element, className, from, to, done) {
                    //TODO:Anton Nesterenko: implement when required
                }
            };
        }).animation('.chr-modal-hide', function() {
            return {
                animate: function(element, className, from, to, done) {
                    //TODO:Anton Nesterenko: implement when required
                }
            };
        })
        .run(function($templateCache) {
            $templateCache.put(DEFAULTS.overlayId, '<div id="modal-overlay"></div>');
            $templateCache.put(DEFAULTS.templateId, '<div class="dialog-body"></div>');
            $templateCache.put(DEFAULTS.dialogTemplateId,
                '<a href="javascript:void(0);" class="modal-dialog-close">X</a>');
        });
})();
