// 请先引入 jQuery 等所需依赖
! function(w, d) {
    const config = {
        info: {
            title: '提示信息',
            dom: '<div id="{0}" class="modal modal-info fade" style="display: none;" aria-hidden="true">\
                    <div class="modal-dialog">\
                        <div class="modal-content">\
                            <div class="modal-header">\
                                <div class="modal-title">{1}</div>\
                            </div>\
                            <div class="modal-body"></div>\
                            <div class="modal-footer">\
                                <button type="button" class="btn btn-primary" data-dismiss="modal">确认</button>\
                            </div>\
                        </div>\
                    </div>\
                </div>'
        }
    };
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    };
    !w.MP && ! function(w) {
        w.MP = {};
        (function(mp) {
            mp.config = config;
            mp.modal = {};
            let info = mp.modal.info = {};
            info.id = "modal-" + (new Date()).getTime();
            info.title = mp.config.info.title;
            info.dom = $(mp.config.info.dom.format(info.id, info.title));
            mp.showInfo = function(msg) {
                let dom = info.dom;
                document.getElementById(info.id) || $(d.body).append(dom);
                dom.find('.modal-body').text(msg);
                dom.modal();
            };
        })(w.MP);
    }(w);
}(window, document);