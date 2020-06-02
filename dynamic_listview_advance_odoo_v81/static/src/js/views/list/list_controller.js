odoo.define('dynamic_listview_advance_odoo_v81.list_controller', function(require) {

    var core = require('web.core');
    var session = require('web.session');
    var ListController = require('web.ListController');
    var QWeb = core.qweb;


    ListController.include({
        init: function (parent, model, renderer, params) {
            this._super(parent, model, renderer, params);
            this.viewInfo = renderer.viewInfo;

            // this.columns = Object.assign({}, ...(this.renderer.columns || []).map((column) =>
            //     ({[column.attrs.name]: column})));
            this.uid = session.uid
            this.renderer.controller = this;
            if (parent.searchview) {
                parent.searchview.listViewRender = renderer;
            }
        },
        start: function () {
            this._super();
            let columns = {};
            (this.renderer.columns || []).map((column) => {
                columns[column.attrs.name] = column;
            });
            this.columns = {...columns};
        },
        _get_node_string: function(field_name) {
            let field = this.viewInfo.viewFields[field_name],
                column = field_name in this.columns ? this.columns[field_name] : {};
            return (column.attrs && column.attrs.string) || field.string;
        },
        setStyle: function () {
            if (this.editable && ["top", "bottom"].includes(this.editable)) {
                this.$buttons.find(".span_edit").addClass("active");
            }
            if (this.viewInfo.for_all) {
                this.$buttons.find("._applyAll").addClass("active");
            }
        },
        onClickApplyAll: function () {
            let $el = $(this);
            $el.hasClass("active") ? $el.removeClass("active") : $el.addClass("active");
        },
        renderButtons: function($node) {
            this._super($node);
            if (this.$buttons) {
                this.setStyle();
                this.$buttons.on("click", ".span_copy", this.onClickCopy.bind(this));
                this.$buttons.on("click", "._applyAll", this.onClickApplyAll);
                this.$buttons.on("click", ".span_color", this.proxy('onClickColor'));
                this.$buttons.on("click", ".span_edit", this.onClickShowEditMode);
                this.$buttons.on("click", ".reset", this.onClickReset.bind(this));
                this.$buttons.on('click', '.su_fields_show li', this.proxy('onClickShowField'));
                this.$buttons.on('click', '.update_fields_show', this.proxy('updateShowField'));
                this.$buttons.on('keypress', '.su_dropdown li > input', this.proxy('onChangeStringField'));
                this.$buttons.on('focusout', '.su_dropdown li > input', this.proxy('onFocusOutTextField'));
                this.$buttons.on('click', '.su_fields_show li > span', this.proxy('onClickSpanCheck'));
                // this.$buttons.on('click', '#apply_for_all_user', this.proxy('onClickApplyAll'));
                this.$buttons.find('#ul_fields_show').sortable();
                this.$buttons.find('#ul_fields_show').disableSelection();
                this.$buttons.on("click", ".dropDownMenu a", this.onClickShowFieldName);
            }
        },

        onClickShowFieldName: function () {
            $(this).parents('.dropdown').find('.dropBtn').text($(this).attr("name"));
        },
        renderColor: function ($el) {
            let DECORATIONS = [
                'decoration-bf',
                'decoration-it',
                'decoration-danger',
                'decoration-info',
                'decoration-muted',
                'decoration-primary',
                'decoration-success',
                'decoration-warning'
            ], archAttr = this.renderer.arch.attrs;
            let wrapDecorations = $('<div class="wColor">'),
                wrapHead = $('<div class="cHead">'), wrapBody = $('<div class="cBody">');
            wrapHead.append(QWeb.render("Color.fields", {widget: this}));
            DECORATIONS.map((decoration) => {
                let line = $('<div class="line" name="'+decoration+'">');
                line.append($('<div class="_color"><span data-decorator="' + decoration + '">Text</span></div>'));
                line.append($('<div class="_field"><input class="form-control" value="' + (archAttr[decoration] || "") + '" /></div>'));
                line.append($('<div class="_operation"></div>'));
                wrapBody.append(line);
            });
            wrapDecorations.append(wrapHead);
            wrapDecorations.append(wrapBody);

            return wrapDecorations[0].outerHTML;
        },
        onClickColor: function (e) {
            let $el = $(e.target);
            if ($el.hasClass("span_color")) {
                let wColor = $el.find(".wColor");
                wColor.hasClass("active") ? wColor.removeClass("active") : wColor.addClass("active");
            }
        },
        onClickCopy: function () {
            let records = this.getSelectedRecords();
            if (records.length) {
                records = records.map((record) => record.res_id);
                this._rpc({
                    model: 'view.dynamic',
                    method: 'copy_record',
                    args: [this.modelName, records],
                }).then(function (result) {
                    location.reload();
                });
            }
        },
        onClickShowEditMode: function (e) {
            $(this).hasClass("active")
                ? $(this).removeClass("active")
                : $(this).addClass("active");
        },
        // onClickApplyAll: function(e){
        //     e.stopPropagation();
        // },
        onClickSpanCheck: function (e) {
            var self = $(e.currentTarget);
            if (e.currentTarget.className.search('span_ticked') >= 0){
                self.parent().removeClass("selected");
                self.removeClass("span_ticked");
            }
            e.stopPropagation();
        },
        onFocusOutTextField: function (e) {
            var self = $(e.currentTarget);
            self.removeClass("display-block");
            self.parent().find('a').removeClass("display-none");
        },
        onChangeStringField: function (e) {
            var self = $(e.currentTarget);
            var text = self.val() + e.key;
            self.parent().find('a').text(text);
        },
        getFieldsShow: function() {
            var fields_show = [];
            var sequence = 1;
            _(this.$buttons.find(".su_fields_show li.selected")).each(function(result) {
                var $result = $(result);
                fields_show.push({string: $result.find('input').val().trim(), sequence: sequence, name: $result.attr("name")});
                sequence += 1;
            });
            return fields_show;
        },
        getViewConfig: function () {
            let $edit = this.$buttons.find(".span_edit"),
                data = {editable: $edit.hasClass('active') ? "bottom" : false, ...this.getDecoration()};
            return data;
        },
        getDecoration: function () {
            let decorations = {};
            this.$buttons.find(".wColor").find(".line").each((idx, item) => {
                let $item = $(item), decoration = $item.attr("name"), value = $item.find("._field input").val() || false;
                decorations[decoration] = value;
            });
            return decorations;
        },
        updateShowField: function () {
            let self = this;
            var values = {model: this.modelName, view_id: this.viewInfo.view_id, fields_show: this.getFieldsShow(),
                config_view: this.getViewConfig(), for_all: this.$buttons.find("._applyAll").hasClass("active")};
            this._rpc({
                model: 'view.dynamic',
                method: 'change_fields',
                kwargs: {values: values},
            }).then(function (result) {
                location.reload();
            });
        },
        onClickShowField: function(e){
            e.stopPropagation();
            var self = $(e.currentTarget);
            if (e.currentTarget.className.search('selected') < 0){
                self.addClass("selected");
                self.find('span').addClass("span_ticked");
            }else{
                self.find('input').addClass("display-block");
                self.find('a').addClass("display-none");
            }
        },
        onClickReset: function () {
            this._rpc({
                model: 'view.dynamic',
                method: 'restore_view',
                kwargs: {view_id: this.viewInfo.view_id},
            }).then(function (result) {
                location.reload();
            });
        }
    });
});
