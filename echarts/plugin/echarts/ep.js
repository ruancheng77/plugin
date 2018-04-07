(function() {
	var config = {
	    // echarts 配置信息
	    echarts: {
	        // 加载指定路径下的 echarts
	        src: "lib/echarts.js",
	        // 指定加载 echarts 的版本
	        version: "4.0.0",
	    },
	    // 插件配置信息
	    ep: {
	        // 是否自动初始化插件
	        enable: false,
	        // 没有数据的时候, 是否显示自定义 dom
	        showEmpty: true,
	        emptyDom: '<div style="position: relative; left: 0; top: 0;">暂无数据</div>',
	        // 指定前缀, 用于拼接 id
	        prefix: 'echarts.',
	        titlePrefix: 'echarts-title.',
	        // 指定插件 js 根路径
	        basePath: 'plugin/echarts',
	        themeBasePath: 'echarts/theme',
//	        theme: 'chalk',	// 需要修改全局样式直接修改主题文件或者换别的主题
	    }
	};    
	this.console = this.console || (function() {
        let c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
        return c;
    })();
	if (!window.$) {
        throw Error("请先引入 jQuery");
    }
	if (!String.prototype.format) {
        String.prototype.format = function() {
            let a = arguments;
            return this.replace(/{(\d+)}/g, function(m, n) {
                return typeof a[n] != 'undefined' ? a[n] : m;
            });
        };
    }
	var createScript = function(src, cb) {
	    var script = document.createElement("script");
	    script.src = src;
	    script.type = "text/javascript";
	    $(document.body).append(script);
	};
	// 载入 echarts
	if (!window.echarts || window.echarts.version != config.echarts.version) {
	    createScript(config.echarts.src);
	}
	// 载入主题
	if (config.ep.theme) {
		createScript(config.ep.themeBasePath + "/" + config.ep.theme + ".js");
	}
	let ep = this.EP = this.EP || {};
    (function(EP) {
		ep.config = config.ep;
		ep.run = function(ids) {
			// 判断是否全局加载：传入 id则加载特定id，否则全局加载
			if (ids) {
				if (ids instanceof Array) {
					var arr = [];
					for (i = 0; i < ids.length; i++) {
						arr.push(ep.init(ids[i]));
					}
					return arr;
				} else if (typeof ids === "string") {
					return ep.init(ids);
				} else {
					throw Error("请输入正确的id或者id数组");
				}
			} else {
				
			}
		};
		ep.init = function(id) {
			if (id.startsWith(ep.config.prefix)) {
				// 判断是否已加载
				if (!ep.get(id)) {
					var dom = document.getElementById(id);
					var module = id.substring(ep.config.prefix.length);
					return ep.loadModule({ dom: dom, module: module });
				} else {
					setTimeout(() => {
						ep.refresh(id);
					}, 200);
				}
			}
		};
		ep.loadModule = function(options) {
			ep.util.loadJS(options.module);
			ep.initModule(options);
		};
		ep.initModule = function(options) {
			var dom = options.dom,
				module = options.module;
			var size = ep.__calDomSize(dom);
			$(dom).css(size);
			var m = new window[module];
			m.dom = dom;
			ep.event.check(m);

			m.module = module;
			m.id = ep.config.prefix + m.module;
			m.titleId = ep.config.titlePrefix + m.module;
			m.logger = m.logger || ep.logger;
			m.setOption = m.setOption || ep.setOption;
			m.theme = m.theme || ep.config.theme;
			m.init();

			ep.event.init(m);
			ep.append(m);
			return m;
		};
		ep.logger = function(msg) {
			var date = (new Date()).toLocaleString();
			console.info("[ Echarts Plugin ] " + date + " >>> " + msg);
		};
		ep.setOption = function(option, notMerge, lazyUpdate) {
			if (typeof option === 'undefined') {
				ep.showEmpty(this);
				return;
			}
			option = option || {};
			notMerge = notMerge || false;
			lazyUpdate = lazyUpdate || true;
			this.title && ep.setTitle(this);
			this.chart.setOption(option, notMerge, lazyUpdate);
		};
		ep.showEmpty = function(module) {
			ep.dispose(module.id);
			if (ep.config.showEmpty) {
				module.dom.appendChild(ep.config.emptyDom)
			}
		};
		ep.setTitle = function(module) {
			var dom = document.getElementById(module.titleId);
			dom && (dom.textContent = module.title);
		}
		ep.util = {};
		ep.util.getScriptUrl = function(module) {
			var modules = module.split("_");
			var url = ep.config.basePath;
			for (i = 0; i < modules.length; i++) {
				url += "/" + modules[i].toLowerCase();
			}
			url += ".js";
			return url;
		};
		ep.util.loadJS = function(module, cb) {
			var url = ep.util.getScriptUrl(module);
			createScript(url, cb);
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
			var chartArr = [];
			for (i = 0; i < moduleArr.length; i++) {
				var m = ep.get(moduleArr[i]);
				chartArr.push(m.chart);
			}
			echarts.connect(chartArr);
		};
		// 取消图标联动
		ep.disconnect = function(moduleArr) {
			if (typeof moduleArr === 'string') {
				var chart = ep.get(moduleArr).chart;
				chart.group = "";
			} else if (moduleArr instanceof Array) {
				for (i = 0; i < moduleArr.length; i++) {
					var c = ep.get(moduleArr[i]).chart;
					c.group = "";
				}
			}
		};
		// 销毁图表
		ep.dispose = function(id) {
			var m = ep.get(id);
			if (typeof m !== 'undefined') {
				m.chart.dispose();
				delete ep.__modules[id];
			}
		};
		// 刷新图表(先销毁再创建)
		ep.refresh = function(id) {
			ep.dispose(id);
			return ep.init(id);
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
			var chart = module.chart;
			setTimeout(() => {
				window.onresize = function () {
					chart.resize();
				}
			}, 200);
			ep.logger("Module [{0}] >>> It's [resize] event is inited.".format([module.module]));
		};
		ep.__calDomSize = function (dom) {
			var $dom = $(dom);
			var parent = $dom.parent();
			var w, h;
			if (!parent[0].style.width.endsWith("%")) {
				w = Math.max($dom.width() || 0, parent.width());
			} else {
				w = parent[0].style.width;
			}
			if (!parent[0].style.height.endsWith("%")) {
				h = Math.max($dom.height() || 0, parent.height());
			} else {
				h = parent[0].style.height;
			}
			return {width: w, height: h};
		}
	})(EP);
})();