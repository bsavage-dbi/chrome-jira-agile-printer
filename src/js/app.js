(function($) {
    'use strict';

    angular.module('chr-print-app', ['chr.modal'])
        .directive('chrDialogView', function($rootScope) {
            return {
                scope: {},
                templateUrl: 'chrDialogView.html',
                controller: function($scope, $modal, $window) {
                    $scope.currentTab = 0;
                    this.getCurrentTab = function() {
                        return $scope.currentTab;
                    };
                    $scope.print = function() {
                        var w = $window.open('', 'print view', 'height=400,width=600');
                        var html = $('#modal-overlay')[0].outerHTML;

                        w.document.write('<html><head>');

                        var style = $('style');
                        for (var i = 0; i < style.length; i++) {
                            var st = style[i];
                            w.document.write(st.outerHTML);
                        }
                        w.document.write('</head><body >');
                        w.document.write(html);
                        w.document.write('</body></html>');

                        w.document.close(); // necessary for IE >= 10
                        w.focus(); // necessary for IE >= 10

                        w.print();
                        w.close();
                    };
                    $scope.printPreview = function() {
                        $scope.itemsToPrint = {};
                        var sprints = $rootScope.GLOBAL_BACKLOG.sprints;

                        for (var i = 0; i < sprints.length; i++) {
                            var sprint = sprints[i];
                            if ($scope.model.sprintSettings[sprint.id]) {
                                var issuesIds = sprint.issuesIds;
                                for (var j = 0; j < issuesIds.length; j++) {
                                    var issueId = issuesIds[j];
                                    $scope.itemsToPrint[issueId] = true;
                                }
                            }
                        }

                        for (var issueIdKey in $scope.issueSettings) {
                            if ($scope.issueSettings.hasOwnProperty(issueIdKey)) {
                                $scope.itemsToPrint[issueIdKey] = $scope.issueSettings[issueIdKey];
                            }
                        }

                        $scope.issueIdsToPrint = [];
                        for (var key in $scope.itemsToPrint) {
                            if ($scope.itemsToPrint.hasOwnProperty(key) && $scope.itemsToPrint[key]) {
                                $scope.issueIdsToPrint.push(key);
                            }
                        }

                        var m = $modal.open({
                            templateId: 'chr-print-preview.html',
                            dialogTemplate: '<div class="chr-issue-item" ng-repeat="id in issueIdsToPrint | orderBy:id" chr-issue-item issue-id="id"></div>',
                            scope: $scope
                        });
                    };
                },
                link: function(scope) {
                    scope.openTab = function(t) {
                        scope.currentTab = t;
                    };
                    $rootScope.model = scope.model = {
                        fieldSettings: {},
                        sprintSettings: {},
                        issueSettings: {}
                    }
                }

            }
        })
        .directive('chrDialogTab', function() {
            return {
                require: '^chrDialogView',
                scope: {
                    tabId: '@'
                },
                replace: true,
                transclude: true,
                templateUrl: 'chrDialogTab.html',
                link: function(scope, element, attrs, ctrl) {
                    scope.view = ctrl;
                }
            };
        })
        .directive('chrFieldSettings', function($rootScope) {
            return {
                scope: {
                    settings: '='
                },
                replace: true,
                templateUrl: 'chrFieldSettings.html',
                link: function(scope) {
                    scope.fields = $rootScope.GLOBAL_FIELDS.fields;
                    for (var i = 0; i < scope.fields.length; i++) {
                        var field = scope.fields[i];
                        scope.settings[field.id] = {
                            order: i,
                            selected: field.id === 'description' ||
                            field.id === 'summary' ||
                            field.id === 'issuekey'
                        }
                    }

                }
            };
        })
        .directive('chrSprintSettings', function($rootScope) {
            return {
                scope: {
                    settings: '='
                },
                replace: true,
                templateUrl: 'chrSprintSettings.html',
                link: function(scope) {
                    scope.sprints = $rootScope.GLOBAL_BACKLOG.sprints;
                    for (var i = 0; i < scope.sprints.length; i++) {
                        var sprint = scope.sprints[i];
                        scope.settings[sprint.id] = {
                            selected: true
                        }
                    }
                }
            };
        })
        .directive('chrIssueSettings', function($rootScope) {
            return {
                scope: {
                    settings: '='
                },
                replace: true,
                templateUrl: 'chrIssueSettings.html',
                link: function(scope) {
                    scope.issues = $rootScope.GLOBAL_BACKLOG.issues;
                    for (var i = 0; i < scope.issues.length; i++) {
                        var issue = scope.issues[i];
                        scope.settings[issue.id] = {
                            selected: true
                        }
                    }
                }
            };
        })
        .directive('chrIssueItem', function($rootScope, $window, $http, $sce) {
            return {
                scope: {
                    issueId: '='
                },
                templateUrl: 'chr-issue-item.html',
                link: function(scope) {
                    scope.convertToSafeHtml = function(val) {
                        return $sce.trustAsHtml(val);
                    };
                    var globalHttp = $window.GLOBAL_HTTP;
                    $http.get(globalHttp.baseUri + '/issue/details.json?rapidViewId=' + globalHttp.boardId +
                        '&issueIdOrKey=' + scope.issueId + '&loadSubtasks=true')
                        .success(function(details) {
                            var fieldSettings = $rootScope.model.fieldSettings;
                            scope.fields = [];
                            for (var i = 0; i < details.fields.length; i++) {
                                var field = details.fields[i];
                                for (var setting in fieldSettings) {
                                    if (fieldSettings.hasOwnProperty(setting)) {
                                        if (fieldSettings[setting] && fieldSettings[setting].selected && field.id === setting) {
                                            scope.fields.push(field);
                                        }
                                    }
                                }
                            }
                        })
                        .error(function(e) {
                            throw e;
                        });
                }
            };
        })
        .run(function($rootScope, $window) {
            $rootScope.GLOBAL_FIELDS = $window.GLOBAL_FIELDS;
            $rootScope.GLOBAL_BACKLOG = $window.GLOBAL_BACKLOG;
        });
})(jQuery);
