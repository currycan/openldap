//是否为内网
var innerip;

//是否进行提示的按钮监听（切换是否显示提示)
$('#isNotifi').on('click', function () {
    var $btn = $(this).text('変更中.......').blur();
    setTimeout(function () {
        if ($btn.hasClass("btn-success")) {
            notifi();
            $btn.removeClass("btn-success").text("已关闭提示")
        } else
            $btn.addClass("btn-success").text("已开启提示")
    }, 1000)
});

//点击条目按钮跳转
function toGo(index) {
    //判断是否开启提示
    if ($('#isNotifi').hasClass("btn-success"))
        giveNotfi(index);
    else {
        openLink(index);
    }
}

//跳转link
function openLink(index) {
    //是否内网
    if (innerip) {
        if (index.localUrl === '') {
            AddressNotFound();
        } else {
            window.open(index.localUrl);
        }
    } else {
        //外网
        if (index.outUrl === '') {
            AddressInaccessible();
        } else {
            window.open(index.outUrl);
        }
    }
}

//访问地址为空
function AddressNotFound() {
    //展示提示信息
    ShowNotice('十分抱歉!', '该模块尚未完成部署,请耐心等待!', 'info', 1000);
}

// 不存在外网地址
function AddressInaccessible() {
    //展示提示信息
    ShowNotice('十分抱歉!', '您处于外网访问模式，但要访问的地址可能不存在外网形式访问', 'error', 1000);
}

//提示窗
function notifi() {
    new PNotify({
        title: '友情提示',
        text: '关闭提示,您将不能得到地址的相关提示信息',
        addclass: 'stack-top-left',
        type: 'warn',
        stack: {
            "dir1": "down",
            "dir2": "right",
            "push": "top"
        }
    })
}

//展示提示窗口
function ShowNotice(title, text, type, delay) {
    PNotify.prototype.options.styling = "bootstrap3";
    new PNotify({
        title: title,
        text: text,
        type: type,
        delay: delay,
        hide: true //是否自动关闭
    });
}

//链接提示窗
function giveNotfi(index) {
    var text = index.remark;
    //判断描述是否为空
    if (text === "") {
        openLink(index);
        return false;
    }
    var percent = 6;
    var notice = new PNotify({
        title: "请稍后",
        addclass: 'stack-top-left bg-primary',
        type: 'info',
        icon: 'icon-spinner4 spinner',
        hide: false,
        buttons: {
            closer: false,
            sticker: false
        },
        opacity: .9,
        width: "250px",
        stack: {
            "dir1": "down",
            "dir2": "right",
            "push": "top"
        }
    });

    setTimeout(function () {
        notice.update({
            // title: false
        });
        var interval = setInterval(function () {

            percent--;
            var options = {
                width: "220px",
                title: percent + " 秒后为您跳转",
                text: "<br>" + text
            };
            if (percent === 1) options.title = "即将跳转，请稍后";
            if (percent <= 0) {
                window.clearInterval(interval);
                options.title = "";
                options.text = "已为您跳转!";
                options.addclass = "bg-success";
                options.type = "success";
                options.hide = false;
                options.buttons = {
                    closer: true,
                    sticker: true
                };
                options.icon = 'icon-check';
                options.opacity = 1;
                options.hide = true;
                options.width = PNotify.prototype.options.width;
                setTimeout(function () {
                    //跳转链接
                    openLink(index);
                }, 1500)
            }
            notice.update(options);
        }, 1000);
    }, 500);
}

//检测是否为外网访问
(function () {
    // 提示语
    var checkNetMessage;
    // 弹出类型
    var noticeType;

    //判断url地址
    if (document.URL.indexOf("ll1121.cn") > 0) {
        checkNetMessage = '检测到您正处于外网环境，所有的定向将会以外网形式跳转';
        innerip = false;
        noticeType = 'success';
    } else {
        checkNetMessage = '检测到您正处于内网环境，所有的定向将会以内网形式跳转';
        innerip = true;
        noticeType = 'info';
    }
    //展示提示信息
    ShowNotice('提示', checkNetMessage, noticeType, 1000);
}());
