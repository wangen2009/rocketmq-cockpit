var selectDefault = "----请选择-----";

$(document).ready(function () {


    Highcharts.theme = {
        colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
        chart: {
            backgroundColor: {
                linearGradient: {x1: 0, y1: 0, x2: 1, y2: 1},
                stops: [[0, 'rgb(255, 255, 255)'], [1, 'rgb(240, 240, 255)']]
            },
            borderWidth: 1,
            plotBackgroundColor: 'rgba(255, 255, 255, .9)',
            plotShadow: true,
            plotBorderWidth: 1
        },
        title: {
            style: {
                color: '#000',
                font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
            }
        },
        subtitle: {
            style: {
                color: '#666666',
                font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
            }
        },
        xAxis: {
            gridLineWidth: 1,
            lineColor: '#000',
            tickColor: '#000',
            labels: {
                style: {
                    color: '#000',
                    font: '11px Trebuchet MS, Verdana, sans-serif'
                }
            },
            title: {
                style: {
                    color: '#333',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    fontFamily: 'Trebuchet MS, Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            minorTickInterval: 'auto',
            lineColor: '#000',
            lineWidth: 1,
            tickWidth: 1,
            tickColor: '#000',
            labels: {
                style: {color: '#000', font: '11px Trebuchet MS, Verdana, sans-serif'}
            },
            title: {
                style: {
                    color: '#333',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    fontFamily: 'Trebuchet MS, Verdana, sans-serif'
                }
            }
        },
        legend: {
            itemStyle: {font: '9pt Trebuchet MS, Verdana, sans-serif', color: 'black'},
            itemHoverStyle: {color: '#039'},
            itemHiddenStyle: {color: 'gray'}
        },
        labels: {
            style: {color: '#99b'}
        },
        navigation: {
            buttonOptions: {theme: {stroke: '#CCCCCC'}}
        }
    };
    // Apply the theme
    Highcharts.setOptions({global: {useUTC: false}});
    var highchartsOptions = Highcharts.setOptions(Highcharts.theme);

    $.get("cockpit/api/project", function (data) {
        var text = document.createTextNode("Project: ");
        var divP = document.getElementById("divPro");
        var selectP = document.createElement("select");
        selectP.id = "selectP";

        selectP.appendChild(createOption(null));
        data.forEach(function (project) {
            selectP.appendChild(createOption(project.name));
        });

        divP.appendChild(text);
        divP.appendChild(selectP);

        selectP.onchange = function () {

            var project = $("#selectP").children('option:selected').val();
            if (-1 != project) {
                $.ajax({
                    async: false,
                    url: "cockpit/api/project/" + project,//查询该project对应的Consumer Group
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    success: function (datas) {
                        var consumerGroup = "";
                        //获取结果集 插入表格
                        $(".cTable-content").children().remove();
                        datas.forEach(function (ConsumerGroup) {
                            if (consumerGroup === "") {
                                consumerGroup = ConsumerGroup.groupName;
                            }
                            var operationLink = $("<a class='showConsumerGroup' href='javascript:;'>show</a>");
                            operationLink.attr("va", ConsumerGroup.groupName);
                            var operation = $("<td></td>");
                            operation.append(operationLink);
                            var item = $("<tr><td>" + ConsumerGroup.groupName + "</td></tr>");
                            item.append(operation);
                            $(".cTable-content").append(item);
                        });
                        //获取第一个结果，并展示其积压曲线
                        showGroup(consumerGroup);
                    }
                });

                $.ajax({
                    async: false,
                    url: "cockpit/api/project/" + project,//查询该project对应的Topic
                    type: "POST",
                    data: project,
                    dataType: "json",
                    contentType: "application/json",
                    success: function (datas) {
                        var top = "";
                        //获取结果集  插入表格
                        $(".tTable-content").children().remove();
                        datas.forEach(function (topic) {
                            if (top === "") {
                                top = topic.topic;
                            }
                            var operationLink = $("<a class='showTopic' href='javascript:;'>show</a>");
                            operationLink.attr("va", topic.topic);
                            var operation = $("<td></td>");
                            operation.append(operationLink);
                            var item = $("<tr><td>" + topic.topic + "</td></tr>");
                            item.append(operation);
                            $(".tTable-content").append(item);
                        });
                        //获取第一个结果，并展示其积压曲线
                        showTopic(top);
                    }
                });
            } else {

            }
        };
    });

    $(document).on("click", ".showConsumerGroup", function(){
        var consumerGroup = $(this).attr("va");
        showGroup(consumerGroup);
    });

    $(document).on("click", ".showTopic", function() {
        var topic = $(this).attr("va");
        showTopic(topic);
    })
});

function createOption(text) {
    var selOption = document.createElement("option");
    selOption.value = null === text ? -1 : text;
    selOption.innerHTML = null === text ? selectDefault : text;
    return selOption;
}

function showGroup(consumerGroup){
    $.ajax({
        async: false,
        url: "cockpit/api/consume-progress" + "/" + consumerGroup + "/" + "-1" + "/" + "-1" + "/" + "-1",
        type: "GET",
        contentType: "application/json; charset=UTF-8",
        dataType: "json",
        success: function (backdata) {
            var line = consumerGroup;
            var x = [];
            backdata.forEach(function (consumeProgress) {
                var temp = [];
                var time = consumeProgress.createTime.replace(new RegExp("-", "gm"), "/");
                temp.push((new Date(time)).getTime());
                temp.push(consumeProgress.diff);
                x.push(temp);
            });
            x.reverse();
            showCharts('#cContainer', line, x);
        }
    });
}

function showTopic(topic){
    $.ajax({
        async: false,
        url: "cockpit/api/topic-progress" + "/" + topic,
        type: "GET",
        contentType: "application/json; charset=UTF-8",
        dataType: "json",
        success: function(backdata) {
            var line = topic;
            var firstB = -1;
            var x = [];
            backdata.reverse();
            backdata.forEach(function(consumeProgress){
                var temp = [];
                var time = consumeProgress.createTime.replace(new RegExp("-","gm"),"/");
                temp.push((new Date(time)).getTime());
                if (-1 === firstB){

                }else{
                    if (consumeProgress.brokerOffset >= firstB){
                        temp.push(Math.round(100*(consumeProgress.brokerOffset - firstB)/(5*60))/100);
                    }else{
                        temp.push(Math.round(0));
                    }
                    x.push(temp);
                }

                firstB = consumeProgress.brokerOffset;
            });

            showCharts('#tContainer', line, x);
        }
    });
}

function showCharts(target ,xsets, ysets) {
    var bodyWidth = document.documentElement.clientWidth;
    var bodyHeight = Math.max(document.documentElement.clientHeight, document.body.scrollHeight);
    $(target).highcharts({
        chart: {
            type: 'spline',
            width: 0.55 * bodyWidth,
            height: 0.35 * bodyHeight
        },
        title: {
            text: 'diff'
        },
        subtitle: {
            text: xsets
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                second: '%H:%M:%S',
                day: '%e. %b',
                month: '%b \'%y',
                year: '%Y'
            }
        },
        yAxis: {
            title: {
                text: 'diff (times)'
            },
            min: null,
            startOnTick: false
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    new Date(this.x) + ': ' + this.y + ' times';
            }
        },

        series: [{
            name: xsets,
            data: ysets
        }]
    });
}
