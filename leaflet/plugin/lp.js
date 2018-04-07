(function () {
	!this.LP && ! function (w) {
		w.LP = {};
		! function (lp) {
			// 配置参数
			lp.configParams = {
				// 是否使用离线地图
				offline: true,
				// map dom 监听事件时间间隔
				listenTime: 1000,
			};
			// 地图初始化参数配置
			lp.initParams = {
				zoom: 12,
				center: [39.90103, 116.39156],
				minZoom: 8,
				maxZoom: 16
			};
			// 使用 geoserver 参数配置
			lp.geoserverParams = {
				// serverUrl: "http://localhost:9999/geoserver",
				serverUrl: "http://123.57.142.43:9999/geoserver",
				workspace: "china",
			};
			// wms 服务 url
			lp.geoserverParams.wmsUrl = lp.geoserverParams.serverUrl + "/" + lp.geoserverParams.workspace + "/wms";
			// 定义的缩放级别
			lp.zoomType = {
				world: 1,
				island: 4,
				province: 7,
				city: 10,
				area: 13
			};

			// 实例化 map 存储对象
			lp.__maps = {};
			// 设置配置参数
			lp.setConfigParams = function (opts) {
				lp.__setOption(lp.configParams, opts);
			};
			// 设置初始化配置参数
			lp.setInitParams = function (opts) {
				lp.__setOption(lp.initParams, opts);
			};
			// 设置 geoserver 配置参数
			lp.setGeoserverParams = function (opts) {
				lp.__setOption(lp.geoserverParams, opts);
			};
			lp.__setOption = function (_opts, opts) {
				for (var k in opts) {
					_opts[k] = opts[k];
				}
			};
			lp.init = function (id, opts) {
				if (lp.__maps[id]) {
					return lp.__maps[id];
				}
				lp.__maps[id] = {};
				! function (m) {
					var offline = lp.configParams.offline;
					m._opts = lp.initParams;
					if (offline) {
						m._opts.crs = L.CRS.EPSG4326;
					}
					var addZoomedListener = true;
					if (opts) {
						if (opts.addZoomedListener !== undefined) {
							addZoomedListener = opts.addZoomedListener;
							delete opts.addZoomedListener;
						}
						lp.__setOption(m._opts, opts);
					}
					// 初始化地图
					m.map = L.map(id, m._opts);

					if (!offline) {
						L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(m.map);
						return;
					} else {
						// wms 图层
						m.wmsLayer = null;
						m.wmsLayerMap = {};
						m.showLayer = function () {
							console.log("当前缩放级别：" + this.map._zoom);
							
							if (!offline) {
								return;
							}
							this.wmsLayer && this.wmsLayer.fire && this.wmsLayer.fire();
							this.wmsLayer && this.wmsLayer.remove && this.wmsLayer.remove();
							this.wmsLayer = L.tileLayer.wms(lp.geoserverParams.wmsUrl, {
								layers: this._getLayer(),
								format: "image/jpeg",
							});
							this.wmsLayer.addTo(this.map);

							// 优化处理
							// var wmsLayer = m.wmsLayerMap[layers];
							// if (wmsLayer) {
							//     for (var w in m.wmsLayerMap) {
							//         if (w != layers) {
							//             m.wmsLayerMap[w].setOpacity(0);
							//         }
							//     }
							//     wmsLayer.setOpacity(1);
							// } else {
							//     m.wmsLayer = L.tileLayer.wms(lp.wmsUrl, {
							//         layers: layers,
							//         transparent: true,
							//         format: "image/jpeg",
							//     });
							//     m.wmsLayer.addTo(m.map);
							//     m.wmsLayerMap[layers] = m.wmsLayer;
							// }
						};
						m._getLayer = function () {
							var zoom = this.map._zoom;
							return lp.geoserverParams.workspace + ':L' + (zoom >= 10 ? zoom : '0' + zoom);
						};
						// 注册监听事件
						if (offline && addZoomedListener) {
							m.map.addEventListener("zoomend", function () {
								m.showLayer();
							});
						}
					}

					// 删除右下角标识
					var control_container = m.map.attributionControl._container;
					if (control_container && control_container.parentNode) {
						control_container.parentNode.removeChild(control_container);
					}

					m.showLayer();
				}(lp.__maps[id]);

				lp.addListen(id);
				lp.initStyle(id);
				return lp.__maps[id];
			};
			// 添加初始化样式
			lp.initStyle = function (mapId) {
				var dom = $("#" + mapId);
				dom.css({
					'opacity': 0.8,
				});
				dom.append($('<div style="position: absolute; left: 0; top: 0; width: 20px; border: 2.5px; border-color: #c0c3c8; border-style: solid; z-index: 1100;"></div>'));
				dom.append($('<div style="position: absolute; left: 0; top: 0; height: 20px; border: 2.5px; border-color: #c0c3c8; border-style: solid; z-index: 1100;"></div>'));
				dom.append($('<div style="position: absolute; right: 0; top: 0; width: 20px; border: 2.5px; border-color: #c0c3c8; border-style: solid; z-index: 1100;"></div>'));
				dom.append($('<div style="position: absolute; right: 0; top: 0; height: 20px; border: 2.5px; border-color: #c0c3c8; border-style: solid; z-index: 1100;"></div>'));
				dom.append($('<div style="position: absolute; left: 0; bottom: 0; width: 20px; border: 2.5px; border-color: #c0c3c8; border-style: solid; z-index: 1100;"></div>'));
				dom.append($('<div style="position: absolute; left: 0; bottom: 0; height: 20px; border: 2.5px; border-color: #c0c3c8; border-style: solid; z-index: 1100;"></div>'));
				dom.append($('<div style="position: absolute; right: 0; bottom: 0; width: 20px; border: 2.5px; border-color: #c0c3c8; border-style: solid; z-index: 1100;"></div>'));
				dom.append($('<div style="position: absolute; right: 0; bottom: 0; height: 20px; border: 2.5px; border-color: #c0c3c8; border-style: solid; z-index: 1100;"></div>'));
			};
			// 根据 id 获取实例化 map 对象
			lp.get = function (id) {
				return lp.__maps[id];
			};
			// 清除实例化 map
			lp.clearMap = function (mapId) {
				var ins = this.maps[mapId];
				if (ins) {
					ins.map && ((ins.map.remove && ins.map.remove()) || (ins.map.fire && ins.map.fire()));
					delete this.maps[mapId];
					lp.removeListen(mapId);
				}
			};
			// 添加监听事件：判断 dom 是否存在，不存在清除实例化 map
			lp.addListen = function (id) {
				lp._listen = lp._listen || {};
				lp._listen[id] = setInterval(function () {
					document.getElementById(id) || lp.clearMap(id);
				}, lp.configParams.listenTime);
			};
			// 删除监听事件
			lp.removeListen = function (id) {
				lp._listen && lp._listen[id] && clearInterval(lp._listen[id]);
			};
			// 清除所有监听事件
			lp.clearListen = function () {
				for (id in lp._listen) {
					clearInterval(lp._listen[id]);
				}
			};
			// 根据一组坐标点,计算出当前缩放级别
			lp.resetZoom = function (mapId, points) {
				var $this = lp.get(mapId);
				if ($this) {
					var $map = $this.map;
					if (points.length > 0) {
						var maxLng = points[0][1];
						var minLng = points[0][1];
						var maxLat = points[0][0];
						var minLat = points[0][0];
						var res;
						for (var i = points.length - 1; i >= 0; i--) {
							res = points[i];
							if (res[1] > maxLng) maxLng = res[1];
							if (res[1] < minLng) minLng = res[1];
							if (res[0] > maxLat) maxLat = res[0];
							if (res[0] < minLat) minLat = res[0];
						};
						var cenLng = (parseFloat(maxLng) + parseFloat(minLng)) / 2;
						var cenLat = (parseFloat(maxLat) + parseFloat(minLat)) / 2;
						var zoom = lp._getZoom($map, maxLng, minLng, maxLat, minLat);
						$this.zoomLevel = zoom;
						$map.setView([cenLat, cenLng], zoom);
						$this.showLayer();
					}
				}
			};
			lp._getZoom = function (map, maxLng, minLng, maxLat, minLat) {
				var zoom = ["50", "100", "200", "500", "1000", "2000", "5000", "10000", "20000", "25000", "50000", "100000", "200000", "500000", "1000000", "2000000"];
				var distance = map.distance
					&& map.distance([maxLat, maxLng], [minLat, minLng])
					|| function () {
						var latlng1 = L.latLng([maxLat, maxLng]), latlng2 = L.latLng([minLat, minLng]);
						var rad = Math.PI / 180,
							lat1 = latlng1.lat * rad,
							lat2 = latlng2.lat * rad,
							a = Math.sin(lat1) * Math.sin(lat2) +
								Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);
						return 6371000 * Math.acos(Math.min(a, 1));
					}();
				for (var i = 0, zoomLen = zoom.length; i < zoomLen; i++) {
					if (zoom[i] - distance > 0) {
						return 18 - i + 2;
					}
				};
			};
		}(w.LP);
	}(this);
})();