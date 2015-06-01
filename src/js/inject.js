(function($) {
    'use strict';

    $(document).ready(function() {
        if (window.location.pathname.endsWith('secure/RapidBoard.jspa')) {
            $('.aui-header-primary').append('<button class="aui-button aui-button-primary chr-print-button">Print</button>');
            var $body = $('body');
            $body.append('<section role="dialog" id="chr-print-dialog" class="aui-layer aui-dialog2 aui-dialog2-xlarge" aria-hidden="true">\n    <chr-dialog-view></chr-dialog-view>\n</section>');
            //$body.append('<div class="chr-print-area" chr-print-area></div>');
            var $chr = $('#chr-print-dialog');
            $('script[type="text/ng-template"]').prependTo($chr);

            $('.chr-print-button').on('click', function() {
                window.AJS.dialog2($chr).show();
            });

            var location = window.location;
            var boardId = /rapidView=(\d*)/.exec(location.search)[1];
            var origin = location.origin;
            var baseUri = origin + '/rest/greenhopper/1.0/xboard';
            window.GLOBAL_HTTP = {
                boardId: boardId,
                baseUri: baseUri
            };
            if (boardId) {
                $.get(baseUri + '/plan/backlog/data.json?rapidViewId=' + boardId, function(d) {
                    window.GLOBAL_BACKLOG = d;
                    if (window.GLOBAL_BACKLOG) {
                        var key = window.GLOBAL_BACKLOG.issues[0].key;
                        $.get(baseUri + '/issue/details.json?rapidViewId=' + boardId + '&issueIdOrKey=' + key + '&loadSubtasks=true',
                            function(data) {
                                window.GLOBAL_FIELDS = data;
                                angular.bootstrap($body, ['chr-print-app']);
                            }).fail(function(e) {
                                throw e;
                            });
                    }
                }).fail(function(e) {
                    throw e;
                });
            } else {
                throw new URIError('BoardId not found');
            }
        }
    });
})(jQuery);
