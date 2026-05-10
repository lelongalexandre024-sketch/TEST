// ==================================================
// GrepoBot Rebuilt - Bot Grepolis complet
// Modules: Autofarm, Autoculture, Autobuild, Autoattack, Assistant
// Sans dépendance serveur externe - 100% autonome
// ==================================================

// ==================== CONSOLELOG ====================
var ConsoleLog = {
    Logs: [],
    Types: ['Autobot', 'Farming', 'Culture', 'Builder', 'Attack', 'System'],
    scrollUpdate: true,
    contentConsole: function () {
        var wrap = $('<fieldset/>', { style: 'float:left; width:472px;' })
            .append($('<legend/>').html('Autobot Console'))
            .append($('<div/>', { class: 'terminal' })
                .append($('<div/>', { class: 'terminal-output' }))
                .scroll(function () { ConsoleLog.LogScrollBottom(); })
            );
        var out = wrap.find('.terminal-output');
        $.each(ConsoleLog.Logs, function (i, entry) { out.append(entry); });
        return wrap;
    },
    Log: function (msg, type) {
        if (this.Logs.length >= 500) this.Logs.shift();
        var pad = function (n) { return n < 10 ? '0' + n : n; };
        var d = new Date();
        var time = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
        var typeName = this.Types[type] || 'System';
        var line = $('<div/>').append($('<div/>', { style: 'width:100%;' }).html(time + ' - [' + typeName + ']: ' + msg));
        this.Logs.push(line);
        var out = $('.terminal-output');
        if (out.length) {
            out.append(line);
            if (this.scrollUpdate) {
                $('.terminal').scrollTop($('.terminal-output')[0].scrollHeight);
            }
        }
        console.log('[GrepoBot][' + typeName + '] ' + msg);
    },
    LogScrollBottom: function () {
        var term = $('.terminal'), out = $('.terminal-output');
        this.scrollUpdate = (term.scrollTop() + term.height() >= out.height() - 5);
    }
};

// ==================== FORMBUILDER ====================
var FormBuilder = {
    button: function (opts) {
        return $('<div/>').append(
            $('<a/>', { class: 'button_new' + (opts['class'] || ''), href: '#', style: 'margin-top:1px;float:left;' + (opts['style'] || '') })
                .append($('<span/>', { class: 'left' }))
                .append($('<span/>', { class: 'right' }))
                .append($('<div/>', { class: 'caption js-caption' }).text(opts.name))
        );
    },
    checkbox: function (opts, onCheck, onUncheck) {
        return $('<div/>', {
            class: 'checkbox_new' + (opts.checked ? ' checked' : '') + (opts.disabled ? ' disabled' : ''),
            style: 'padding: 5px;' + (opts.style || '')
        })
            .append($('<input/>', { type: 'checkbox', name: opts.name, id: opts.id, checked: opts.checked, style: 'display:none;' }))
            .append($('<div/>', { class: 'cbx_icon', rel: opts.name }))
            .append($('<div/>', { class: 'cbx_caption' }).text(opts.text))
            .bind('click', function () {
                $(this).toggleClass('checked');
                $(this).find('input[type="checkbox"]').prop('checked', $(this).hasClass('checked'));
                if ($(this).hasClass('checked')) { if (onCheck) onCheck(); }
                else { if (onUncheck) onUncheck(); }
            });
    },
    input: function (opts) {
        return $('<div/>', { style: 'padding:5px;' })
            .append($('<label/>', { for: opts.id }).text((opts.name || '') + ': '))
            .append($('<div/>', { class: 'textbox', style: opts.style || '' })
                .append($('<div/>', { class: 'left' }))
                .append($('<div/>', { class: 'right' }))
                .append($('<div/>', { class: 'middle' })
                    .append($('<div/>', { class: 'ie7fix' })
                        .append($('<input/>', { type: opts.type || 'text', id: opts.id, name: opts.id, value: opts.value || '' }))
                    )
                )
            );
    },
    selectBox: function (opts) {
        var sel = $('<select/>', { id: opts.id, name: opts.name, style: opts.styles || '' });
        $.each(opts.options, function (i, o) {
            sel.append($('<option/>', { value: o.value, selected: o.value == opts.value }).text(o.name));
        });
        return $('<div/>', { style: 'padding:5px;' })
            .append($('<label/>', { for: opts.id }).text(opts.label || ''))
            .append(sel);
    },
    timerBoxSmall: function (opts) {
        return $('<div/>', { class: 'single-progressbar js-progressbar', id: opts.id, style: opts.styles || '' })
            .append($('<div/>', { class: 'progress' }).append($('<div/>', { class: 'indicator', style: 'width:0%;' })))
            .append($('<div/>', { class: 'caption' })
                .append($('<span/>', { class: 'text' }))
                .append($('<span/>', { class: 'value_container' })
                    .append($('<span/>', { class: 'curr' }).html(opts.text || '-'))
                )
            );
    },
    gameWrapper: function (title, id, content, style) {
        return $('<div/>', { class: 'game_inner_box', id: id, style: style || '' })
            .append($('<div/>', { class: 'game_border' })
                .append($('<div/>', { class: 'game_header bold', id: 'settings_header' }).html(title))
                .append($('<div/>').append(content))
            );
    }
};

// ==================== DATA EXCHANGER ====================
var DataExchanger = {
    Auth: function (action, params, callback) {
        // Mode cracké : bypass auth, appel direct du callback avec données simulées
        callback({
            trial_time: 99999,
            premium_time: 99999,
            facebook_like: 0,
            assistant_settings: '',
            autofarm_settings: '',
            autoculture_settings: '',
            autobuild_settings: '',
            building_queue: [],
            units_queue: [],
            ships_queue: [],
            player_email: 'cracked@grepobot.com',
            success: true
        });
    },
    game_data: function (town_id, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/data?' + $.param({ town_id: town_id, action: 'get', h: Game.csrfToken });
        $.ajax({
            url: url,
            data: { json: JSON.stringify({ types: [{ type: 'bar' }, { type: 'backbone' }], town_id: town_id, nl_init: false }) },
            method: 'POST', dataType: 'json',
            success: function (r) { if (r && callback) callback(r); }
        });
    },
    switch_town: function (town_id, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/index?' + $.param({ town_id: town_id, action: 'switch_town', h: Game.csrfToken });
        $.ajax({ url: url, method: 'GET', dataType: 'json', success: function (r) { if (callback) callback(r); } });
    },
    claim_loads: function (town_id, farm_ids, claim_factor, time_option, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/farm_town_overviews?' + $.param({ town_id: Game.townId, action: 'claim_loads', h: Game.csrfToken });
        $.ajax({
            url: url,
            data: { json: JSON.stringify({ farm_town_ids: farm_ids, time_option: time_option, claim_factor: claim_factor, current_town_id: town_id, town_id: Game.townId, nl_init: true }) },
            method: 'POST', dataType: 'json',
            success: function (r) { if (callback) callback(r ? r.json || r : {}); }
        });
    },
    farm_town_overviews: function (town_id, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/farm_town_overviews';
        var town = ITowns.towns[town_id];
        $.ajax({
            url: url,
            data: {
                town_id: Game.townId, action: 'get_farm_towns_for_town', h: Game.csrfToken,
                json: JSON.stringify({ island_x: town.getIslandCoordinateX(), island_y: town.getIslandCoordinateY(), current_town_id: town_id, nl_init: true })
            },
            method: 'GET', dataType: 'json',
            success: function (r) { if (callback) callback(r ? r.json || r : {}); }
        });
    },
    building_main: function (town_id, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/building_main';
        $.ajax({
            url: url,
            data: { town_id: town_id, action: 'index', h: Game.csrfToken, json: JSON.stringify({ town_id: town_id, nl_init: true }) },
            method: 'GET', dataType: 'json',
            success: function (r) { if (callback) callback(r ? r.json || r : {}); }
        });
    },
    building_place: function (town_id, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/building_place';
        $.ajax({
            url: url,
            data: { town_id: town_id, action: 'culture', h: Game.csrfToken, json: JSON.stringify({ town_id: town_id, nl_init: true }) },
            method: 'GET', dataType: 'json',
            success: function (r) { if (callback) callback(r ? r.json || r : {}); }
        });
    },
    start_celebration: function (town_id, type, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/building_place?' + $.param({ town_id: town_id, action: 'start_celebration', h: Game.csrfToken });
        $.ajax({
            url: url,
            data: { json: JSON.stringify({ celebration_type: type, town_id: town_id, nl_init: true }) },
            method: 'POST', dataType: 'json',
            success: function (r) { if (callback) callback(r ? r.json || r : {}); }
        });
    },
    build_building: function (town_id, building, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/building_main?' + $.param({ town_id: town_id, action: 'build', h: Game.csrfToken });
        $.ajax({
            url: url,
            data: { json: JSON.stringify({ building: building, town_id: town_id, nl_init: true }) },
            method: 'POST', dataType: 'json',
            success: function (r) { if (callback) callback(r ? r.json || r : {}); }
        });
    },
    attack_planner: function (town_id, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/attack_planer';
        $.ajax({
            url: url,
            data: { town_id: town_id, action: 'attacks', h: Game.csrfToken, json: JSON.stringify({ town_id: town_id, nl_init: true }) },
            method: 'GET', dataType: 'json',
            success: function (r) { if (callback) callback(r ? r.json || r : {}); }
        });
    },
    send_units: function (town_id, type, target_id, units, callback) {
        var url = window.location.protocol + '//' + document.domain + '/game/town_info?' + $.param({ town_id: town_id, action: 'send_units', h: Game.csrfToken });
        $.ajax({
            url: url,
            data: { json: JSON.stringify($.extend({ id: target_id, type: type, town_id: town_id, nl_init: true }, units)) },
            method: 'POST', dataType: 'json',
            success: function (r) { if (callback) callback(r ? r.json || r : {}); }
        });
    }
};

// ==================== ASSISTANT ====================
var Assistant = {
    settings: { town_names: false, player_name: false, alliance_name: false },
    init: function () { ConsoleLog.Log('Initialize Assistant', 0); },
    setSettings: function (s) {
        if (s && s !== '') { try { $.extend(this.settings, JSON.parse(s)); } catch (e) {} }
        this.initSettings();
    },
    initSettings: function () {
        var f = $('#map_towns .flag');
        this.settings.town_names ? f.addClass('active_town') : f.removeClass('active_town');
        this.settings.player_name ? f.addClass('active_player') : f.removeClass('active_player');
        this.settings.alliance_name ? f.addClass('active_alliance') : f.removeClass('active_alliance');
    },
    contentSettings: function () {
        var self = this;
        return $('<fieldset/>', { id: 'Assistant_settings', style: 'float:left;width:472px;height:270px;' })
            .append($('<legend/>').html('Assistant Settings'))
            .append(FormBuilder.checkbox({ text: 'Afficher noms de villes sur la carte', id: 'assistant_town_names', name: 'assistant_town_names', checked: self.settings.town_names }))
            .append(FormBuilder.checkbox({ text: 'Afficher noms de joueurs sur la carte', id: 'assistant_player_names', name: 'assistant_player_names', checked: self.settings.player_name }))
            .append(FormBuilder.checkbox({ text: 'Afficher noms d\'alliances sur la carte', id: 'assistant_alliance_names', name: 'assistant_alliance_names', checked: self.settings.alliance_name }))
            .append(FormBuilder.button({ name: 'Sauvegarder', style: 'top:120px;' }).on('click', function () {
                var vals = $('#Assistant_settings').serializeArray();
                var map = {};
                $.each(vals, function (i, v) { map[v.name] = v.value; });
                self.settings.town_names = !!map['assistant_town_names'];
                self.settings.player_name = !!map['assistant_player_names'];
                self.settings.alliance_name = !!map['assistant_alliance_names'];
                self.initSettings();
                HumanMessage.success('Paramètres sauvegardés !');
            }));
    }
};

// ==================== AUTOFARM ====================
var Autofarm = {
    settings: {
        autostart: false,
        loot_option: 2,       // 1=petit, 2=moyen, 3=grand
        wait_time: 60,        // secondes entre chaque farm
        enabled_towns: {}
    },
    isRunning: false,
    interval: null,
    init: function () { ConsoleLog.Log('Initialize Autofarm', 1); },
    setSettings: function (s) {
        if (s && s !== '') { try { $.extend(this.settings, JSON.parse(s)); } catch (e) {} }
    },
    start: function () {
        this.isRunning = true;
        ConsoleLog.Log('Autofarm démarré', 1);
        this.farm();
    },
    stop: function () {
        this.isRunning = false;
        if (this.interval) { clearTimeout(this.interval); this.interval = null; }
        ConsoleLog.Log('Autofarm arrêté', 1);
    },
    checkReady: function (town) {
        var t = town.modules.Autofarm.isReadyTime;
        if (t === 0) return true;
        var now = Timestamp ? Timestamp.now() : Math.floor(Date.now() / 1000);
        return t <= now ? true : t;
    },
    farm: function () {
        if (!this.isRunning) return;
        var self = this;
        var towns = ModuleManager.playerTowns;
        var i = 0;
        function next() {
            if (!self.isRunning || i >= towns.length) {
                if (self.isRunning) {
                    ConsoleLog.Log('Autofarm: cycle terminé, prochaine vérification dans ' + self.settings.wait_time + 's', 1);
                    self.interval = setTimeout(function () { self.farm(); }, self.settings.wait_time * 1000);
                }
                return;
            }
            var town = towns[i++];
            self.farmTown(town, function () {
                setTimeout(next, Autobot.randomize(2000, 4000));
            });
        }
        next();
    },
    farmTown: function (town, callback) {
        var self = this;
        DataExchanger.farm_town_overviews(town.id, function (data) {
            if (!data || !data.farm_towns) { if (callback) callback(); return; }
            var farmIds = [];
            $.each(data.farm_towns, function (id, ft) {
                if (ft.looted_at !== undefined) farmIds.push(parseInt(id));
            });
            if (farmIds.length === 0) { if (callback) callback(); return; }
            ConsoleLog.Log('Farming ' + farmIds.length + ' villages depuis ' + town.name, 1);
            DataExchanger.claim_loads(town.id, farmIds, self.settings.loot_option, 1, function (r) {
                var now = Timestamp ? Timestamp.now() : Math.floor(Date.now() / 1000);
                town.modules.Autofarm.isReadyTime = now + self.settings.wait_time;
                if (callback) callback();
            });
        });
    },
    contentSettings: function () {
        var self = this;
        return $('<fieldset/>', { id: 'Autofarm_settings', style: 'float:left;width:472px;height:270px;' })
            .append($('<legend/>').html('Autofarm Settings'))
            .append(FormBuilder.checkbox({ text: 'Démarrage automatique', id: 'autofarm_autostart', name: 'autofarm_autostart', checked: self.settings.autostart }))
            .append(FormBuilder.selectBox({
                id: 'autofarm_loot', name: 'autofarm_loot', label: 'Type de pillage: ',
                styles: 'width:150px;', value: self.settings.loot_option,
                options: [{ value: '1', name: 'Petit (rapide)' }, { value: '2', name: 'Moyen' }, { value: '3', name: 'Grand (lent)' }]
            }))
            .append(FormBuilder.selectBox({
                id: 'autofarm_wait', name: 'autofarm_wait', label: 'Délai entre cycles: ',
                styles: 'width:150px;', value: self.settings.wait_time,
                options: [{ value: '30', name: '30 secondes' }, { value: '60', name: '1 minute' }, { value: '120', name: '2 minutes' }, { value: '300', name: '5 minutes' }]
            }))
            .append(FormBuilder.button({ name: 'Sauvegarder', style: 'top:160px;' }).on('click', function () {
                var s = $('#Autofarm_settings select');
                self.settings.loot_option = parseInt($('#autofarm_loot').val());
                self.settings.wait_time = parseInt($('#autofarm_wait').val());
                self.settings.autostart = $('#Autofarm_settings .checkbox_new').first().hasClass('checked');
                HumanMessage.success('Autofarm sauvegardé !');
                ConsoleLog.Log('Autofarm settings mis à jour', 1);
            }));
    }
};

// ==================== AUTOCULTURE ====================
var Autoculture = {
    settings: {
        autostart: false,
        festival: true,
        olympic: true,
        procession: true
    },
    isRunning: false,
    interval: null,
    init: function () { ConsoleLog.Log('Initialize Autoculture', 2); },
    setSettings: function (s) {
        if (s && s !== '') { try { $.extend(this.settings, JSON.parse(s)); } catch (e) {} }
    },
    start: function () {
        this.isRunning = true;
        ConsoleLog.Log('Autoculture démarré', 2);
        this.culture();
    },
    stop: function () {
        this.isRunning = false;
        if (this.interval) { clearTimeout(this.interval); this.interval = null; }
        ConsoleLog.Log('Autoculture arrêté', 2);
    },
    checkReady: function (town) {
        var t = town.modules.Autoculture.isReadyTime;
        if (t === 0) return true;
        var now = Timestamp ? Timestamp.now() : Math.floor(Date.now() / 1000);
        return t <= now ? true : t;
    },
    culture: function () {
        if (!this.isRunning) return;
        var self = this;
        var towns = ModuleManager.playerTowns;
        var i = 0;
        function next() {
            if (!self.isRunning || i >= towns.length) {
                if (self.isRunning) {
                    self.interval = setTimeout(function () { self.culture(); }, 60000);
                }
                return;
            }
            var town = towns[i++];
            self.cultureTown(town, function () {
                setTimeout(next, Autobot.randomize(2000, 5000));
            });
        }
        next();
    },
    cultureTown: function (town, callback) {
        var self = this;
        DataExchanger.building_place(town.id, function (data) {
            if (!data || !data.place) { if (callback) callback(); return; }
            var place = data.place;
            var celebTypes = [];
            if (self.settings.festival && place.running_festival === false) celebTypes.push('festival');
            if (self.settings.olympic && place.running_olympic === false) celebTypes.push('olympic');
            if (self.settings.procession && place.running_procession === false) celebTypes.push('procession');
            if (celebTypes.length === 0) { if (callback) callback(); return; }
            var type = celebTypes[0];
            ConsoleLog.Log('Lancement ' + type + ' à ' + town.name, 2);
            DataExchanger.start_celebration(town.id, type, function (r) {
                var now = Timestamp ? Timestamp.now() : Math.floor(Date.now() / 1000);
                town.modules.Autoculture.isReadyTime = now + 3600;
                if (callback) callback();
            });
        });
    },
    contentSettings: function () {
        var self = this;
        return $('<fieldset/>', { id: 'Autoculture_settings', style: 'float:left;width:472px;height:270px;' })
            .append($('<legend/>').html('Autoculture Settings'))
            .append(FormBuilder.checkbox({ text: 'Démarrage automatique', id: 'autoculture_autostart', name: 'autoculture_autostart', checked: self.settings.autostart }))
            .append(FormBuilder.checkbox({ text: 'Festival de la ville', id: 'autoculture_festival', name: 'autoculture_festival', checked: self.settings.festival }))
            .append(FormBuilder.checkbox({ text: 'Jeux Olympiques', id: 'autoculture_olympic', name: 'autoculture_olympic', checked: self.settings.olympic }))
            .append(FormBuilder.checkbox({ text: 'Procession de victoire', id: 'autoculture_procession', name: 'autoculture_procession', checked: self.settings.procession }))
            .append(FormBuilder.button({ name: 'Sauvegarder' }).on('click', function () {
                var f = $('#Autoculture_settings .checkbox_new');
                self.settings.autostart = $(f[0]).hasClass('checked');
                self.settings.festival = $(f[1]).hasClass('checked');
                self.settings.olympic = $(f[2]).hasClass('checked');
                self.settings.procession = $(f[3]).hasClass('checked');
                HumanMessage.success('Autoculture sauvegardé !');
            }));
    }
};

// ==================== AUTOBUILD ====================
var Autobuild = {
    settings: {
        autostart: false,
        check_interval: 300,  // secondes
        queue: []
    },
    isRunning: false,
    interval: null,
    buildQueue: [],
    init: function () { ConsoleLog.Log('Initialize Autobuild', 3); },
    setSettings: function (s) {
        if (s && s !== '') { try { $.extend(this.settings, JSON.parse(s)); } catch (e) {} }
    },
    setQueue: function (bq) {
        if (bq && bq.length) this.buildQueue = bq;
    },
    start: function () {
        this.isRunning = true;
        ConsoleLog.Log('Autobuild démarré', 3);
        this.build();
    },
    stop: function () {
        this.isRunning = false;
        if (this.interval) { clearTimeout(this.interval); this.interval = null; }
        ConsoleLog.Log('Autobuild arrêté', 3);
    },
    checkReady: function (town) {
        var t = town.modules.Autobuild.isReadyTime;
        if (t === 0) return true;
        var now = Timestamp ? Timestamp.now() : Math.floor(Date.now() / 1000);
        return t <= now ? true : t;
    },
    calls: function (url) {
        if (url.indexOf('building_main/index') !== -1 || url.indexOf('building_main/build') !== -1) {
            ConsoleLog.Log('Autobuild: activité de construction détectée', 3);
        }
    },
    build: function () {
        if (!this.isRunning) return;
        var self = this;
        var towns = ModuleManager.playerTowns;
        var i = 0;
        function next() {
            if (!self.isRunning || i >= towns.length) {
                if (self.isRunning) {
                    self.interval = setTimeout(function () { self.build(); }, self.settings.check_interval * 1000);
                }
                return;
            }
            var town = towns[i++];
            self.buildTown(town, function () {
                setTimeout(next, Autobot.randomize(3000, 7000));
            });
        }
        next();
    },
    buildTown: function (town, callback) {
        var self = this;
        DataExchanger.building_main(town.id, function (data) {
            if (!data || !data.queue) { if (callback) callback(); return; }
            // Si la file est vide et on a des bâtiments à construire
            if (data.queue.length === 0 && self.buildQueue.length > 0) {
                var next = self.buildQueue[0];
                ConsoleLog.Log('Construction de ' + next + ' à ' + town.name, 3);
                DataExchanger.build_building(town.id, next, function (r) {
                    if (r && !r.error) {
                        ConsoleLog.Log('Construction lancée: ' + next, 3);
                        self.buildQueue.shift();
                    }
                    var now = Timestamp ? Timestamp.now() : Math.floor(Date.now() / 1000);
                    town.modules.Autobuild.isReadyTime = now + self.settings.check_interval;
                    if (callback) callback();
                });
            } else {
                if (callback) callback();
            }
        });
    },
    contentSettings: function () {
        var self = this;
        var buildingOptions = [
            { value: 'main', name: 'Sénat' }, { value: 'hide', name: 'Caverne' },
            { value: 'storage', name: 'Entrepôt' }, { value: 'farm', name: 'Ferme' },
            { value: 'lumber', name: 'Scierie' }, { value: 'stoner', name: 'Carrière' },
            { value: 'ironer', name: 'Fonderie' }, { value: 'market', name: 'Port' },
            { value: 'docks', name: 'Chantier naval' }, { value: 'barracks', name: 'Caserne' },
            { value: 'wall', name: 'Muraille' }, { value: 'temple', name: 'Temple' }
        ];
        var queueList = $('<div/>', { id: 'build_queue_list', style: 'padding:5px;max-height:120px;overflow-y:auto;border:1px solid #999;margin:5px 0;' });
        function refreshQueue() {
            queueList.empty();
            if (self.buildQueue.length === 0) {
                queueList.html('<em style="color:#999;">File vide</em>');
            } else {
                $.each(self.buildQueue, function (i, b) {
                    queueList.append($('<div/>').html((i + 1) + '. ' + b + ' <a href="#" style="color:red;" data-i="' + i + '">[x]</a>').find('a').on('click', function (e) {
                        e.preventDefault();
                        self.buildQueue.splice($(this).data('i'), 1);
                        refreshQueue();
                    }).end());
                });
            }
        }
        refreshQueue();
        var sel = FormBuilder.selectBox({ id: 'build_add_select', name: 'build_add_select', label: 'Ajouter: ', styles: 'width:150px;', value: 'main', options: buildingOptions });
        return $('<fieldset/>', { id: 'Autobuild_settings', style: 'float:left;width:472px;height:270px;' })
            .append($('<legend/>').html('Autobuild Settings'))
            .append(FormBuilder.checkbox({ text: 'Démarrage automatique', id: 'autobuild_autostart', name: 'autobuild_autostart', checked: self.settings.autostart }))
            .append($('<div/>', { style: 'padding:5px;' }).html('<strong>File de construction:</strong>'))
            .append(queueList)
            .append(sel)
            .append(FormBuilder.button({ name: 'Ajouter à la file', style: 'margin-left:5px;' }).on('click', function () {
                var val = $('#build_add_select').val();
                if (val) { self.buildQueue.push(val); refreshQueue(); }
            }))
            .append(FormBuilder.button({ name: 'Sauvegarder', style: 'margin-top:5px;' }).on('click', function () {
                self.settings.autostart = $('#Autobuild_settings .checkbox_new').first().hasClass('checked');
                HumanMessage.success('Autobuild sauvegardé !');
            }));
    }
};

// ==================== AUTOATTACK ====================
var Autoattack = {
    settings: { autostart: false, interval: 60 },
    isRunning: false,
    interval: null,
    init: function () { ConsoleLog.Log('Initialize Autoattack', 4); },
    setSettings: function (s) {
        if (s && s !== '') { try { $.extend(this.settings, JSON.parse(s)); } catch (e) {} }
    },
    start: function () {
        this.isRunning = true;
        ConsoleLog.Log('Autoattack démarré', 4);
        this.attack();
    },
    stop: function () {
        this.isRunning = false;
        if (this.interval) { clearTimeout(this.interval); this.interval = null; }
        ConsoleLog.Log('Autoattack arrêté', 4);
    },
    calls: function (url, response) {
        if (url.indexOf('attack_planer/attacks') !== -1) {
            ConsoleLog.Log('Autoattack: planning détecté', 4);
        }
    },
    attack: function () {
        if (!this.isRunning) return;
        var self = this;
        var towns = ModuleManager.playerTowns;
        var i = 0;
        function next() {
            if (!self.isRunning || i >= towns.length) {
                if (self.isRunning) {
                    self.interval = setTimeout(function () { self.attack(); }, self.settings.interval * 1000);
                }
                return;
            }
            var town = towns[i++];
            self.attackFromTown(town, function () {
                setTimeout(next, Autobot.randomize(3000, 8000));
            });
        }
        next();
    },
    attackFromTown: function (town, callback) {
        DataExchanger.attack_planner(town.id, function (data) {
            if (!data || !data.planned_attacks || data.planned_attacks.length === 0) {
                if (callback) callback();
                return;
            }
            var attacks = data.planned_attacks;
            var j = 0;
            function sendNext() {
                if (j >= attacks.length) { if (callback) callback(); return; }
                var atk = attacks[j++];
                if (atk.ready) {
                    ConsoleLog.Log('Envoi attaque depuis ' + town.name + ' vers cible ' + atk.target_id, 4);
                    DataExchanger.send_units(town.id, 'attack', atk.target_id, atk.units, function (r) {
                        setTimeout(sendNext, Autobot.randomize(1000, 3000));
                    });
                } else {
                    sendNext();
                }
            }
            sendNext();
        });
    },
    contentSettings: function () {
        var self = this;
        return $('<fieldset/>', { id: 'Autoattack_settings', style: 'float:left;width:472px;height:270px;' })
            .append($('<legend/>').html('Autoattack Settings'))
            .append($('<div/>', { style: 'padding:10px;color:#c00;border:1px solid #c00;margin:5px;border-radius:4px;' })
                .html('⚠️ Autoattack envoie les attaques planifiées depuis le Planificateur d\'attaque du Capitaine. Assurez-vous d\'avoir planifié vos attaques.')
            )
            .append(FormBuilder.checkbox({ text: 'Démarrage automatique', id: 'autoattack_autostart', name: 'autoattack_autostart', checked: self.settings.autostart }))
            .append(FormBuilder.selectBox({
                id: 'autoattack_interval', name: 'autoattack_interval', label: 'Vérification toutes les: ',
                styles: 'width:150px;', value: self.settings.interval,
                options: [{ value: '30', name: '30 secondes' }, { value: '60', name: '1 minute' }, { value: '120', name: '2 minutes' }, { value: '300', name: '5 minutes' }]
            }))
            .append(FormBuilder.button({ name: 'Sauvegarder' }).on('click', function () {
                self.settings.autostart = $('#Autoattack_settings .checkbox_new').first().hasClass('checked');
                self.settings.interval = parseInt($('#autoattack_interval').val());
                HumanMessage.success('Autoattack sauvegardé !');
            }));
    }
};

// ==================== MODULE MANAGER ====================
var ModuleManager = {
    models: {
        Town: function () {
            this.key = null; this.id = null; this.name = null;
            this.modules = {
                Autofarm: { isReadyTime: 0 },
                Autoculture: { isReadyTime: 0 },
                Autobuild: { isReadyTime: 0 }
            };
        }
    },
    playerTowns: [],
    modules: {
        Autofarm: { isOn: false },
        Autoculture: { isOn: false },
        Autobuild: { isOn: false },
        Autoattack: { isOn: false }
    },
    init: function () {
        this.loadPlayerTowns();
        this.initButtons();
        this.initTimer();
    },
    loadPlayerTowns: function () {
        var self = this;
        self.playerTowns = [];
        var k = 0;
        $.each(ITowns.towns, function (id, town) {
            var t = new self.models.Town();
            t.key = k++; t.id = town.id; t.name = town.name;
            self.playerTowns.push(t);
        });
        self.playerTowns.sort(function (a, b) { return a.name > b.name ? 1 : -1; });
        ConsoleLog.Log('Villes chargées: ' + self.playerTowns.length, 0);
    },
    initTimer: function () {
        $('#time_autobot').append(FormBuilder.timerBoxSmall({ id: 'Autobot_timer', styles: '', text: 'Prêt' })).show();
    },
    initButtons: function () {
        var self = this;
        var mods = ['Autofarm', 'Autoculture', 'Autobuild', 'Autoattack'];
        $.each(mods, function (i, mod) {
            var btn = $('#' + mod + '_onoff');
            btn.removeClass('disabled');
            btn.find('span').mousePopup(new MousePopup('Démarrer ' + mod));
            btn.on('click', function (e) {
                e.preventDefault();
                if (mod === 'Autoattack' && !Autobot.checkPremium('captain')) {
                    HumanMessage.error('Le Capitaine est requis pour Autoattack.');
                    return false;
                }
                if (self.modules[mod].isOn) {
                    self.modules[mod].isOn = false;
                    btn.removeClass('on');
                    btn.find('span').mousePopup(new MousePopup('Démarrer ' + mod));
                    window[mod].stop();
                    HumanMessage.success(mod + ' désactivé.');
                    ConsoleLog.Log(mod + ' désactivé.', 0);
                } else {
                    self.modules[mod].isOn = true;
                    btn.addClass('on');
                    btn.find('span').mousePopup(new MousePopup('Arrêter ' + mod));
                    window[mod].start();
                    HumanMessage.success(mod + ' activé.');
                    ConsoleLog.Log(mod + ' activé.', 0);
                }
            });
        });
    },
    callbackAuth: function (data) {
        Autobot.isLogged = true;
        ConsoleLog.Log('Authentification réussie [MODE CRACKÉ]', 0);
        if (data.assistant_settings) Assistant.setSettings(data.assistant_settings);
        Autofarm.init(); Autofarm.setSettings(data.autofarm_settings);
        Autoculture.init(); Autoculture.setSettings(data.autoculture_settings);
        Autobuild.init(); Autobuild.setSettings(data.autobuild_settings);
        Autobuild.setQueue(data.building_queue);
        Autoattack.init();
        ModuleManager.init();
        // Autostart si configuré
        if (Autofarm.settings.autostart) { ModuleManager.modules.Autofarm.isOn = true; $('#Autofarm_onoff').addClass('on'); Autofarm.start(); }
        if (Autoculture.settings.autostart) { ModuleManager.modules.Autoculture.isOn = true; $('#Autoculture_onoff').addClass('on'); Autoculture.start(); }
        if (Autobuild.settings.autostart) { ModuleManager.modules.Autobuild.isOn = true; $('#Autobuild_onoff').addClass('on'); Autobuild.start(); }
    }
};

// ==================== AUTOBOT PRINCIPAL ====================
var Autobot = {
    title: 'GrepoBot',
    version: '5.1-Rebuilt',
    isLogged: false,
    toolbox_element: null,
    Account: {
        player_id: Game.player_id,
        player_name: Game.player_name,
        world_id: Game.world_id,
        locale_lang: Game.locale_lang,
        csrfToken: Game.csrfToken
    },
    botWnd: undefined,
    init: function () {
        ConsoleLog.Log('GrepoBot ' + Autobot.version + ' initialisé', 0);
        Autobot.authenticate();
        Autobot.initAjax();
        Autobot.initMapTownFeature();
        Autobot.fixMessage();
        Assistant.init();
    },
    authenticate: function () {
        DataExchanger.Auth('login', Autobot.Account, function (data) {
            ModuleManager.callbackAuth(data);
        });
    },
    fixMessage: function () {
        var orig = HumanMessage._initialize;
        HumanMessage._initialize = function () {
            orig.apply(this, arguments);
            $(window).unbind('click');
        };
    },
    initAjax: function () {
        $(document).ajaxComplete(function (e, xhr, settings) {
            if (settings.url.indexOf('/game/') !== -1 && xhr.readyState === 4 && xhr.status === 200) {
                var parts = settings.url.split('?');
                if (parts.length > 1) {
                    var action = parts[0].replace('/game/', '') + '/' + (parts[1].split('&').filter(function (p) { return p.indexOf('action=') === 0; })[0] || '').replace('action=', '');
                    if (typeof Autobuild !== 'undefined') Autobuild.calls(action);
                    if (typeof Autoattack !== 'undefined') Autoattack.calls(action, xhr.responseText);
                }
            }
        });
    },
    initMapTownFeature: function () {
        var orig = MapTiles.createTownDiv;
        MapTiles.createTownDiv = function () {
            var result = orig.apply(this, arguments);
            return Autobot.town_map_info(result, arguments[0]);
        };
    },
    town_map_info: function (elements, town) {
        if (!elements || !elements.length || !town || !town.player_name) return elements;
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].className === 'flag town') {
                if (typeof Assistant !== 'undefined') {
                    if (Assistant.settings.town_names) $(elements[i]).addClass('active_town');
                    if (Assistant.settings.player_name) $(elements[i]).addClass('active_player');
                    if (Assistant.settings.alliance_name) $(elements[i]).addClass('active_alliance');
                }
                $(elements[i]).append('<div class="player_name">' + (town.player_name || '') + '</div>');
                $(elements[i]).append('<div class="town_name">' + town.name + '</div>');
                $(elements[i]).append('<div class="alliance_name">' + (town.alliance_name || '') + '</div>');
                break;
            }
        }
        return elements;
    },
    checkPremium: function (type) {
        return $('.advisor_frame.' + type + ' div').hasClass(type + '_active');
    },
    randomize: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    toHHMMSS: function (s) {
        var h = ~~(s / 3600), m = ~~(s % 3600 / 60), sec = s % 60;
        return (h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
    },
    initWnd: function () {
        if (!Autobot.isLogged) return;
        if (Autobot.botWnd !== undefined) { try { Autobot.botWnd.close(); } catch (e) {} Autobot.botWnd = undefined; }
        Autobot.botWnd = Layout.dialogWindow.open('', Autobot.title + ' v<span style="font-size:10px;">' + Autobot.version + '</span>', 520, 380, '', false);
        Autobot.botWnd.setHeight([380]);
        Autobot.botWnd.setPosition(['center', 'center']);
        var w = Autobot.botWnd.getJQElement();
        var menu = $('<div/>', { class: 'menu_wrapper', style: 'left:78px;right:14px;' })
            .append($('<ul/>', { class: 'menu_inner' })
                .append(Autobot.addMenuItem('AUTHORIZE', 'Account', 'Account'))
                .append(Autobot.addMenuItem('CONSOLE', 'Console', 'Console'))
                .append(Autobot.addMenuItem('ASSISTANT', 'Assistant', 'Assistant'))
                .append(Autobot.addMenuItem('FARMMODULE', 'Farm', 'Autofarm'))
                .append(Autobot.addMenuItem('CULTUREMODULE', 'Culture', 'Autoculture'))
                .append(Autobot.addMenuItem('CONSTRUCTMODULE', 'Build', 'Autobuild'))
                .append(Autobot.addMenuItem('ATTACKMODULE', 'Attack', 'Autoattack'))
            );
        w.append(menu);
        $('#Autobot-AUTHORIZE').click();
    },
    addMenuItem: function (id, label, module) {
        return $('<li/>').append(
            $('<a/>', { class: 'submenu_link', href: '#', id: 'Autobot-' + id, rel: module })
                .click(function () {
                    Autobot.botWnd.getJQElement().find('li a.submenu_link').removeClass('active');
                    $(this).addClass('active');
                    Autobot.botWnd.setContent2(Autobot.getContent($(this).attr('rel')));
                    if (module === 'Console') {
                        var t = $('.terminal'), o = $('.terminal-output')[0];
                        if (o) t.scrollTop(o.scrollHeight);
                    }
                })
                .append($('<span/>', { class: 'left' })
                    .append($('<span/>', { class: 'right' })
                        .append($('<span/>', { class: 'middle' }).html(label))
                    )
                )
        );
    },
    getContent: function (module) {
        if (module === 'Console') return ConsoleLog.contentConsole();
        if (module === 'Account') return Autobot.contentAccount();
        if (typeof window[module] !== 'undefined' && typeof window[module].contentSettings === 'function') {
            return window[module].contentSettings();
        }
        return $('<div/>').html('Module non disponible');
    },
    contentAccount: function () {
        var info = {
            'Joueur:': Game.player_name,
            'Monde:': Game.world_id,
            'Rang:': Game.player_rank,
            'Villes:': Game.player_villages,
            'Langue:': Game.locale_lang,
            'Statut:': '✅ Bot actif [Cracké]',
            'Version:': Autobot.version
        };
        var tbody = $('<tbody/>');
        var i = 0;
        $.each(info, function (k, v) {
            tbody.append($('<tr/>', { class: i % 2 ? 'game_table_even' : 'game_table_odd' })
                .append($('<td/>', { style: 'background-color:#DFCCA6;width:35%;' }).html(k))
                .append($('<td/>').html(v))
            );
            i++;
        });
        return FormBuilder.gameWrapper('Compte', 'account_property_wrapper',
            $('<table/>', { class: 'game_table layout_main_sprite', cellspacing: '0', width: '100%' }).append(tbody),
            'margin-bottom:9px;'
        )[0].outerHTML;
    },
    initWindow: function () {
        $('.nui_main_menu').css('top', '249px');
        $('<div/>', { class: 'nui_bot_toolbox' })
            .append($('<div/>', { class: 'bot_menu layout_main_sprite' })
                .append($('<ul/>')
                    .append($('<li/>', { id: 'Autofarm_onoff', class: 'disabled' }).append($('<span/>', { class: 'autofarm farm_town_status_0' })))
                    .append($('<li/>', { id: 'Autoculture_onoff', class: 'disabled' }).append($('<span/>', { class: 'autoculture farm_town_status_0' })))
                    .append($('<li/>', { id: 'Autobuild_onoff', class: 'disabled' }).append($('<span/>', { class: 'autobuild toolbar_activities_recruits' })))
                    .append($('<li/>', { id: 'Autoattack_onoff', class: 'disabled' }).append($('<span/>', { class: 'autoattack sword_icon' })))
                    .append($('<li/>').append(
                        $('<span/>', { href: '#', class: 'botsettings circle_button_settings' })
                            .on('click', function () { if (Autobot.isLogged) Autobot.initWnd(); })
                            .mousePopup(new MousePopup(DM.getl10n('COMMON').main_menu.settings))
                    ))
                )
            )
            .append($('<div/>', { id: 'time_autobot', class: 'time_row' }))
            .append($('<div/>', { class: 'bottom' }))
            .insertAfter('.nui_left_box');
        Autobot.toolbox_element = $('.nui_bot_toolbox');
    }
};

// ==================== DÉMARRAGE ====================
(function () {
    String.prototype.capitalize = function () { return this.charAt(0).toUpperCase() + this.slice(1); };
    $.fn.serializeObject = function () {
        var o = {}, a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) o[this.name] = [o[this.name]];
                o[this.name].push(this.value || '');
            } else { o[this.name] = this.value || ''; }
        });
        return o;
    };

    var timer = setInterval(function () {
        if (window === null) return;
        // Attendre que le jeu soit chargé
        if ($('.nui_main_menu').length && typeof ITowns !== 'undefined' && !$.isEmptyObject(ITowns.towns)) {
            clearInterval(timer);
            ConsoleLog.Log('Jeu chargé, démarrage de GrepoBot...', 5);
            Autobot.initWindow();
            Autobot.init();
        }
        // Page de reconnexion
        if (/grepolis\.com\/start\?nosession/.test(window.location.href)) {
            clearInterval(timer);
        }
    }, 1000);
})();
