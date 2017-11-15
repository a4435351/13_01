odoo.define('su_dynamic_listview.dynamic_listview', function(require) {
    var Model = require('web.Model');
    var ListView = require('web.ListView');

    ListView.include({
        render_buttons: function($node) {
            this._super($node);
            if (this.$buttons) {
                this.$buttons.on('click', '.su_fields_show li', this.proxy('onClickShowField'));
                this.$buttons.on('click', '.update_fields_show', this.proxy('updateShowField'));
                this.$buttons.on('keypress', '.su_dropdown li > input', this.proxy('onChangeStringField'));
                this.$buttons.on('focusout', '.su_dropdown li > input', this.proxy('onFocusOutTextField'));
                this.$buttons.on('click', '.su_fields_show li > span', this.proxy('onClickSpanCheck'));
                this.$buttons.find('#ul_fields_show').sortable();
                this.$buttons.find('#ul_fields_show').disableSelection();
            }
        },
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
        updateShowField: function () {
            // var self = this;
            var values = {model: this.model, view_id: this.fields_view.view_id, fields_show: this.getFieldsShow()};
            new Model("show.field").call('change_fields',  [values]).done(function (result) {
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
        }
    });
});