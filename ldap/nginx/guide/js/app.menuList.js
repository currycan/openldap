//初始化链接列表
(function () {

    //读取本地json数据[后期可以改成远程调用]
    $.ajax({
        type: 'GET',
        url: 'source/data.json',
        contentType: "application/json;cherset=utf-8",
        dataType: "json",
        async: false,
        success: function (data) {
            //渲染列表
            showMenuList(data);
        }
    });

    //展示菜单集合
    function showMenuList(data) {
        //判断是否为空
        if (JSON.stringify(data) === "{}" || $.isEmptyObject(data)) {
            return false;
        }

        //判断集合是否为空
        if (data.titleList.length === 0) {
            return false;
        }

        //按照目录结构,循环拼接html信息
        //整体html片段
        var resultHtml = '';
        //一级分类
        $.each(data.titleList, function (n, obj) {
            //一级分类名称
            resultHtml += '<hr/>' + '<p>' + obj.name + '</p>';
            //开始div
            resultHtml += '<div class="row" style="padding: 10px 30px;">';

            //二级分类
            resultHtml += secondMenu(obj);

            //结束div
            resultHtml += '</div>';
        });

        $("#menuList").append(resultHtml);

    }

    //二级分类
    function secondMenu(data) {
        //二级分类
        var secondHtml = "";
        //判断二级分类集合
        if ($.isEmptyObject(data) || data.childList.length === 0) {
            return false;
        }

        //默认class
        var secondMenuClass = "panel panel-success";
        //二级分类
        $.each(data.childList, function (n, obj) {
            //判断class
            if (n === 1) {
                secondMenuClass = "panel panel-info";
            } else if (n === 2) {
                secondMenuClass = "panel panel-danger";
            }
            //开始div
            secondHtml += '<div class="col-md-4">';
            secondHtml += '<div class="' + secondMenuClass + '">';
            secondHtml += '<div class="panel-heading">' + obj.name + '</div>';

            //三级分类
            secondHtml += thirdMenu(obj);

            //结束div
            secondHtml += '</div></div>';
        });

        return secondHtml;
    }

    //三级分类
    function thirdMenu(data) {
        //三级分类
        var thirdHtml = "";
        //判断三级分类集合
        if ($.isEmptyObject(data) || data.childList.length === 0) {
            return thirdHtml;
        }

        //开始div
        thirdHtml += '<ul class="list-group">';
        //三级分类
        $.each(data.childList, function (n, obj) {
            //将Json对象转为字符串,且将json串里的双引号替换成单引号
            var jsonStr = JSON.stringify(obj).replace(/\"/g, "'");
            //循环列表
            thirdHtml += '<li class="list-group-item">';
            thirdHtml += '<a onclick="toGo(' + jsonStr + ')">' + obj.name + '</a>';
            thirdHtml += '</li>';
        });
        //结束div
        thirdHtml += '</ul>';

        return thirdHtml;
    }
}());
