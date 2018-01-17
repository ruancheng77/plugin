var module = "DEMO_1";
if (!window[module]) {
    window[module] = function() {};
}
(function(Module) {
    Module.prototype.init = function() {
        var dom = this.dom = document.getElementById(this.id);
        var chart = this.chart = echarts.init(this.dom, this.theme,
            this.initOptions);
        this.initChart();
    };
    Module.prototype.initChart = function() {
        var that = this;
        var option = that.getOptionByResult();
        that.setOption(option);
    };
    Module.prototype.getOptionByResult = function() {
        var option = {
            color: ['#3398DB'],
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisTick: {
                    alignWithLabel: true
                }
            }],
            yAxis: [{
                type: 'value'
            }],
            series: [{
                name: '直接访问',
                type: 'bar',
                barWidth: '60%',
                data: [10, 52, 200, 334, 390, 330, 220]
            }]
        };
        return option;
    }
    Module.prototype.setOption = function(option) {
        this.chart.setOption(option);
    };
})(window[module]);