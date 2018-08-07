QUnit.test('Bindings general tests', function (assert) {

    var chart = Highcharts.stockChart('container', {
            yAxis: {
                labels: {
                    align: 'left'
                }
            },
            series: [{
                type: 'ohlc',
                id: 'aapl',
                name: 'AAPL Stock Price',
                data: [
                    [0, 12, 15, 10, 13],
                    [1, 13, 16, 9, 15],
                    [2, 15, 15, 11, 12],
                    [3, 12, 12, 11, 12],
                    [4, 12, 15, 12, 15],
                    [5, 11, 11, 10, 10],
                    [6, 10, 16, 10, 12],
                    [7, 12, 17, 12, 17],
                    [8, 17, 18, 15, 15],
                    [9, 15, 19, 12, 12]
                ]
            }],
            stockTools: {
                gui: {
                    enabled: true
                }
            }
        }),
        bindings = chart.options.stockTools.bindings,
        points = chart.series[0].points,
        controller = TestController(chart),
        annotationsCounter = 0,
        i = 0;

    // CSS Styles are not loaded, so hide left bar. If we don't hide the bar,
    // chart will be rendered outside the visible page and events will not be
    // fired (TestController issue)
    document.getElementsByClassName('highcharts-menu-wrapper')[0].style.display = 'none';

    // Shorthand for selecting a button
    function selectButton(name) {
        // Bind annotation to the chart events:
        chart.stockToolbar.bindingsButtonClick(
            document.getElementsByClassName('highcharts-' + name)[0],
            bindings[name],
            {
                stopPropagation: Highcharts.noop
            }
        );
    }

    // Annotations with multiple steps:
    Highcharts.each(
        [
            'circle-annotation',
            // 'rectangle-annotation',
            'segment',
            'arrow-segment',
            'ray',
            'arrow-ray',
            'infinity-line',
            'arrow-infinity-line',
            'crooked3',
            'crooked5',
            'elliott3',
            'elliott5',
            'pitchfork',
            'fibonacci',
            'parallel-channel'
            // 'highcharts-measure'
        ],
        function (name) {
            selectButton(name);

            // Start and steps: annotations, run each step
            controller.triggerOnChart(
                'click',
                points[1].plotX,
                points[1].plotY
            );
            controller.triggerOnChart(
                'mousemove',
                points[3].plotX,
                points[3].plotX
            );

            Highcharts.each(bindings[name].steps, function (step, index) {
                controller.triggerOnChart(
                    'click',
                    points[4 + index].plotX,
                    points[4 + index].plotY
                );
                controller.triggerOnChart(
                    'mousemove',
                    points[5 + index].plotX,
                    points[5 + index].plotY
                );
            });

            assert.strictEqual(
                chart.annotations.length,
                ++annotationsCounter,
                'Annotation: ' + name + ' added without errors.'
            );
        }
    );

    // Annotations with just one "start" event:
    Highcharts.each(
        [
            'label-annotation',
            'vertical-line',
            'horizontal-line',
            'vertical-counter',
            'vertical-label',
            'vertical-arrow'
            // 'vertical-double-arrow'
        ],
        function (name) {
            selectButton(name);

            controller.triggerOnChart(
                'click',
                points[2].plotX,
                points[2].plotY
            );
            controller.triggerOnChart(
                'mousemove',
                points[3].plotX,
                points[3].plotX
            );

            assert.strictEqual(
                chart.annotations.length,
                ++annotationsCounter,
                'Annotation: ' + name + ' added without errors.'
            );
        }
    );


    // Flags tests:
    // TO DO: Enable once Flag form will be ready
    /*
    Highcharts.each(
        [
            'flag-circlepin',
            'flag-diamondpin',
            'flag-squarepin',
            'flag-simplepin'
        ],
        function (name) {
            var seriesLength = chart.series.length;

            console.log(document.getElementsByClassName('highcharts-' + name)[0])

            selectButton(name);

            controller.triggerOnChart(
                'click',
                points[2].plotX,
                points[2].plotY
            );
            controller.triggerOnChart(
                'mousemove',
                points[3].plotX,
                points[3].plotX
            );

            assert.strictEqual(
                chart.series.length,
                seriesLength + 1,
                'Flag: ' + name + ' added without errors.'
            );
        }
    );
    */

    // Individual button events:

    // Current Price Indicator
    /*
    selectButton('current-price-indicator');
    assert.strictEqual(
        chart.series[0].lastVisiblePrice &&
            chart.series[0].lastVisiblePrice.visibility,
        'visible',
        'Last price in the range visible.'
    );
    assert.strictEqual(
        chart.series[0].lastPrice &&
            chart.series[0].lastPrice.visibility,
        'visible',
        'Last price in the dataset visible.'
    );

    selectButton('current-price-indicator');
    assert.strictEqual(
        chart.series[0].lastVisiblePrice &&
            chart.series[0].lastVisiblePrice.visibility,
        Highcharts.UNDEFINED,
        'Last price in the range hidden.'
    );
    assert.strictEqual(
        chart.series[0].lastPrice &&
            chart.series[0].lastPrice.visibility,
        Highcharts.UNDEFINED,
        'Last price in the dataset hidden.'
    );
    */

    // Annotations:
    var visibleAnnotations = false;
    // Hide all:
    selectButton('toggle-annotations');

    Highcharts.each(chart.annotations, function (annotation) {
        if (annotation.options.visible) {
            visibleAnnotations = true;
        }
    });

    assert.strictEqual(
        visibleAnnotations,
        false,
        'All annotations are hidden.'
    );

    // Show all:
    selectButton('toggle-annotations');

    visibleAnnotations = true;
    Highcharts.each(chart.annotations, function (annotation) {
        if (!annotation.options.visible) {
            visibleAnnotations = false;
        }
    });

    assert.strictEqual(
        visibleAnnotations,
        true,
        'All annotations are visible.'
    );

    // Series types change:
    Highcharts.each(
        ['line', 'ohlc', 'candlestick'],
        function (type) {
            selectButton('series-type-' + type);
            assert.strictEqual(
                chart.series[0].type,
                type,
                'Series type changed to ' + type + '.'
            );
        }
    );

    /*
    // Saving chart in the local storage
    selectButton('save-chart');
    assert.strictEqual(
        Highcharts.defined(localStorage.getItem('highcharts-stock-tools-chart')),
        true,
        'Chart saved in the local storage'
    );
    localStorage.removeItem('highcharts-stock-tools-chart');
    */

    // Test yAxis resizers and adding indicators:
    for (i = 0; i < 9; i++) {
        chart.stockToolbar.utils.manageIndicators.call(
            chart.stockToolbar,
            {
                linkedTo: 'aapl',
                fields: {
                    'params.index': '0',
                    'params.period': '5'
                },
                type: 'atr'
            }
        );
        assert.close(
            parseFloat(chart.yAxis[0].options.height),
            i < 4 ?
                (100 - (i + 1) * 20) :
                100 / (i + 2),
            0.0001, // up to 0.0001% is fine
            'Correct height for MAIN yAxis (' + (i + 2) + ' panes - indicator.add).'
        );
        assert.close(
            parseFloat(chart.yAxis[i + 2].options.height),
            i < 4 ?
                20 :
                100 / (i + 2),
            0.0001, // up to 0.0001% is fine
            'Correct height for LAST yAxis (' + (i + 2) + ' panes - indicator.add).'
        );
    }

    for (i = 9; i > 0; i--) {
        chart.stockToolbar.utils.manageIndicators.call(
            chart.stockToolbar,
            {
                remove: true,
                id: chart.series[chart.series.length - 2].options.id
            }
        );

        assert.close(
            parseFloat(chart.yAxis[0].options.height),
            i < 6 ?
                100 - (i - 1) * 20 :
                100 / i,
            0.005, // up to 0.5% is fine
            'Correct height for main yAxis (' + (i + 1) + ' pane(s) - indicator.remove).'
        );
    }

});
