var app = {};

app.toolbarHeight = 42;

app.medias = {
    mobile: {
        width: 320,
        height: 480
    },
    iphone5: {
        width: 320,
        height: 568
    },
    'small-tablet': {
        width: 600,
        height: 800
    },
    ipad: {
        width: 768,
        height: 1024
    }
};

app.init = function() {
    app.mainWindow = chrome.app.window.current();
    app.loadSettings(function(settings){
        app.settings = settings;
        app.restoreLastMedia();
        app.setupWindowOnBoundsChanged();
        app.setupInput();
        app.setupButtons();
    });
};

app.loadSettings = function(callback) {
    var initialWindowWidth = Math.max(400, Math.min(800, screen.width)),
        initialWindowHeight = Math.max(400, Math.min(800, initialWindowWidth * (screen.height / screen.width))),
        initialWindowLeft = (screen.width - initialWindowWidth) / 2,
        initialWindowTop = (screen.height - initialWindowHeight) / 2
    ;

    app.defaultSettings = {
        window: {
            url: false,
            media: 'iphone5',
            left: initialWindowLeft,
            top: initialWindowTop
        }
    };

    chrome.storage.sync.get(null, function(settings){
        callback($.extend(true, {}, app.defaultSettings, settings));
    });
};

app.saveSettings = function() {
    //chrome.storage.sync.set(app.settings);
};

app.restoreLastMedia = function() {
    app.resizeWindowToMedia();
    app.mainWindow.moveTo(app.settings.window.left, app.settings.window.top);
    app.mainWindow.show();
};

app.setupWindowOnBoundsChanged = function() {
    chrome.app.window.current().onBoundsChanged = {
        dispatch: function() {
            $.extend(app.settings.window, app.mainWindow.getBounds());
            app.saveSettings();
        }
    };
};

app.setupInput = function() {
    $('input').keypress(function(e){
        var $input = $(this),
            url = $input.val()
        ;
        if (e.keyCode === 13 && url) {
            app.window.navigate(url);
        }
    });

    if (app.settings.window.url) {
        $('input').val(app.settings.window.url);
        app.window.navigate(app.settings.window.url);
    }

    setTimeout(function(){
        $('input').focus();
    }, 300);
};

app.setupButtons = function() {
    $('.buttons .maximize').click(function(){
        $(document).dblclick();
    });

    $('.buttons .close').click(function(){
        chrome.app.window.current().close();
    });

    var updateInfo = function() {
        var media = app.medias[app.settings.window.media];
        $('#tools .info b').html($('#devices a.active').attr('title'));
        $('#tools .info span').html('Size: ' + media.width + '&times;' + media.height);
    };

    $('#devices a').click(function(){
        $('#devices a.active').removeClass('active');
        $(this).addClass('active');
        app.settings.window.media = $(this).data('media');
        updateInfo();
        app.resizeWindowToMedia();
        app.saveSettings();
    });

    $('#devices a[data-media="' + app.settings.window.media + '"]').addClass('active');
    updateInfo();
};

app.resizeWindowToMedia = function() {
    var media = app.medias[app.settings.window.media];
    app.mainWindow.resizeTo(media.width, media.height + app.toolbarHeight);
    //$('webview')[0].reload();
};

app.window = {};

app.window.navigate = function(url) {
    if (!/https?:\/\//.test(url)) {
        url = 'http://' + url;
    }
    $('html').addClass('webview-navigated');
    $('webview').css('opacity', 1).get(0).setAttribute('src', url);
    app.settings.window.url = url;
    app.saveSettings();
};

app.init();