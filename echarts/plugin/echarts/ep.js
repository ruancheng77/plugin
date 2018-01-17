(function() {
    // 配置信息
    const config = {
        // echarts 配置信息
        echarts: {
            // 加载指定路径下的 echarts
            src: "lib/echarts.js",
            // 指定加载 echarts 的版本
            version: "4.0.0"
        },
        // 插件配置信息
        ep: {
            // 是否自动初始化插件
            enable: false,
            // 指定前缀, 用于拼接 id
            prefix: 'echarts.',
            // 指定插件 js 根路径
            basePath: 'plugin/echarts'
        }
    };
    this.console = this.console || (function() {
        let c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
        return c;
    })();
    // 字符串格式化方法
    if (!String.prototype.format) {
        String.prototype.format = function() {
            let a = arguments;
            return this.replace(/{(\d+)}/g, function(m, n) {
                return typeof a[n] != 'undefined' ? a[n] : m;
            });
        };
    }
    if (!window.$) {
        throw Error("请先引入 jQuery");
    }
    let createScript = function(src) {
        let script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        $(document.body).append(script);
    };
    if (!window.echarts || window.echarts.version != config.echarts.version) {
        createScript(config.echarts.src);
    }
    let ep = this.EP = this.EP || {};
    (function(EP) {
        ep.config = config.ep;
        ep.logger = function(msg) {
            let date = (new Date()).toLocaleString();
            console.info(date + " >>> " + msg);
        };
        ep.run = function(id) {
            // 判断是否全局加载：传入 id则加载特定id，否则全局加载
            if (id) {
                // id以数组形式传入
                if (id instanceof Array) {
                    for (let i = 0; i < id.length; i++) {
                        ep.init(id[i]);
                    }
                } else {
                    ep.init(id);
                }
            } else {
                let doms = $("[id]");
                $.each(doms, function(i, dom) {
                    ep.init(dom.id);
                });
            }
        };
        ep.init = function(id) {
            if (id.startsWith(ep.config.prefix)) {
                let dom = $('[id="' + id + '"]')[0];
                let module = id.substring(ep.config.prefix.length);
                ep.loadModule({ dom: dom, module: module });
            }
        };
        ep.loadModule = function(options) {
            ep.util.loadJS(options.module);
            ep.initModule(options);
        };
        ep.initModule = function(options) {
            let dom = options.dom,
                module = options.module;
            $(dom).css({ width: "100%", height: "100%" });
            let m = new window[module];
            m.dom = dom;
            ep.event.check(m);

            m.prefix = ep.config.prefix;
            m.module = module;
            m.id = m.prefix + m.module;
            m.logger = m.logger || ep.logger;
            m.init();

            ep.event.init(m);
            ep.append(m);
        };

        ep.util = {};
        ep.util.getScriptUrl = function(module) {
            let modules = module.split("_");
            let url = ep.config.basePath;
            for (let i = 0; i < modules.length; i++) {
                url += "/" + modules[i].toLowerCase();
            }
            url += ".js";
            return url;
        };
        ep.util.loadJS = function(module) {
            let url = ep.util.getScriptUrl(module);
            createScript(url);
        };

        ep.__modules = {};
        ep.get = function(id) {
            return ep.__modules[id];
        }
        ep.append = function(module) {
            if (ep.get(module.id) === undefined) {
                ep.__modules[module.id] = module;
            }
        };

        // 图标联动
        ep.connect = function(moduleArr) {
            let chartArr = [];
            for (let i = 0; i < moduleArr.length; i++) {
                let m = ep.get(moduleArr[i]);
                chartArr.push(m.chart);
            }
            echarts.connect(chartArr);
        };
        // 取消图标联动
        ep.disconnect = function(moduleArr) {
            if (typeof moduleArr === 'string') {
                let chart = ep.get(moduleArr).chart;
                chart.group = "";
            } else if (moduleArr instanceof Array) {
                for (let i = 0; i < moduleArr.length; i++) {
                    let c = ep.get(moduleArr[i]).chart;
                    c.group = "";
                }
            }
        };
        // 销毁图标
        ep.dispose = function(id) {
            let m = ep.get(id);
            m.chart.dispose();
            delete ep.__modules[id];
        };

        ep.event = {};
        ep.event.check = function(module) {
            this.checkDom(module);
        };
        ep.event.checkDom = function(module) {
            if (module.dom == undefined || module.dom == null)
                throw Error("Can not found any dom's id equal to " + module.id);
            ep.logger("Dom [{0}] >>> It's dom is checked. Dom size ({1} * {2}).".format(module.dom.id, module.dom.clientWidth, module.dom.clientHeight));
        };
        ep.event.init = function(module) {
            this.initResizeEvent(module);
        };
        ep.event.initResizeEvent = function(module) {
            let resize = module.resize || {};
            let isResize = resize.isResize || true;
            let wp = resize.wp || 1;
            let hp = resize.hp || 1;
            if (isResize === true) {
                let chart = module.chart;
                $(window).resize(function() {
                    let dom = chart.getDom();
                    let parent = $(dom).parent();
                    let w = parent.width();
                    let h = parent.height();
                    let size = {
                        width: w * wp,
                        height: h * hp
                    };
                    $(dom).css(size);
                    chart.resize(size);
                });
                ep.logger("Module [{0}] >>> It's [resize] event is inited.".format([module.module]));
            }
        };
        ep.config.enable && ep.run();
    })(EP);
})();