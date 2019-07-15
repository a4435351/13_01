odoo.define('dynamic_listview_advance_odoo_v81.dynamic_listview', function(require) {
    var core = require('web.core');
    var ListView = require('web.ListView');
    var ListRenderer = require('web.ListRenderer');
    var ListController = require('web.ListController');

    ListView.include({
        init: function (viewInfo, params) {
            this._super(viewInfo, params);
            this.rendererParams.viewInfo = viewInfo;
        }
    });

    ListRenderer.include({
        init: function (parent, state, params) {
            this._super(parent, state, params);
            this.viewInfo = params.viewInfo;
            this.parent = parent;
        },
        _renderView: function () {
            var self = this;
            var res = this._super();

            this.$el.before("<table class='tbl_fixed'></table>");
            var $table = this.$el.find("table");

            var tableOffset = $table.offset().top;
            var $header = this.$el.find("table thead");
            var $tblFix = $("<table class='"+$table.attr("class")+"'></table>");
            var $fixedHeader = $tblFix.append($header.clone()).hide();
            $fixedHeader.find('thead').addClass('theadlala');
            $fixedHeader.find('.theadlala .o_list_record_selector input').attr("id", "lili");
            $fixedHeader.find('.theadlala .o_list_record_selector label').attr("for", "lili");
            $fixedHeader.find('.theadlala .o_list_record_selector input').click(this._onToggleSelectionOk.bind(this));
            this.$el.before($fixedHeader);
            this.parent.$el.bind("scroll", function() {
                var offset = $(this).scrollTop();
                if (offset > tableOffset && $fixedHeader.is(":hidden")) {
                    $fixedHeader.show();
                    $tblFix.css({position: 'absolute', zIndex: 10000, tableLayout: 'fixed'});
                    self.$el.css({overflow: 'scroll', position: 'absolute', top: '0px', bottom: '0px'});
                    self.$el.bind("scroll", function () {
                        var _offset = $(this).scrollTop()
                        if (_offset > tableOffset && $fixedHeader.is(":hidden")) {
                            $fixedHeader.show();
                        }
                        else if (_offset == tableOffset) {
                            $fixedHeader.hide();
                        }
                    });
                    $.each($header.find('tr > th'), function(ind,val){
                        var original_width = $(val).outerWidth();
                        var original_padding = $(val).css("padding");
                        $($fixedHeader.find('tr > th')[ind]).css({padding: original_padding, display: 'inline-block', width: original_width});
                    });
                }
                else if (offset == tableOffset) {
                }
            })
            return res
        },
        _onToggleSelection: function (event) {
            var checked = $(event.currentTarget).prop('checked') || false;
            this.parent.$el.find('.theadlala .o_list_record_selector input').prop("checked", checked);
            this._super(event);
        },
        _onToggleSelectionOk: function (event) {
            var checked = $(event.currentTarget).prop('checked') || false;
            this.$el.find('thead .o_list_record_selector input').prop("checked", checked);
            this.$('tbody .o_list_record_selector input:not(":disabled")').prop('checked', checked);
            this._updateSelection();
        },
    });

    ListController.include({
        init: function (parent, model, renderer, params) {
            this._super(parent, model, renderer, params);
            this.viewInfo = renderer.viewInfo;
        },
        _get_node_string: function(field) {
            var _field = this.viewInfo.fields[field.attrs.name];
            var result = _field.string;
            if (field.attrs.hasOwnProperty("string")) {
                result = field.attrs.string;
            }
            return result;
        },

        renderButtons: function($node) {
            this._super($node);
            if (this.$buttons) {
                this.$buttons.on('click', '.su_fields_show li', this.proxy('onClickShowField'));
                this.$buttons.on('click', '.reset_fields_show', this.proxy('resetShowField'));
                this.$buttons.on('click', '.update_fields_show', this.proxy('updateShowField'));
                this.$buttons.on('keypress', '.su_dropdown li > input', this.proxy('onChangeStringField'));
                this.$buttons.on('focusout', '.su_dropdown li > input', this.proxy('onFocusOutTextField'));
                this.$buttons.on('click', '.su_fields_show li .cb_ok input', this.proxy('onClickSpanCheck'));
                this.$buttons.find('#ul_fields_show').sortable();
                this.$buttons.find('#ul_fields_show').disableSelection();
            }
        },
        onClickSpanCheck: function (e) {
            var self = $(e.currentTarget);
            if (self.is(":checked")) {
                self.parents('li').addClass("selected");
                // alert('checked');
            }else{
                self.parents('li').removeClass("selected");
                self.parents('li').find('.lilo input').removeClass("display-block");
                self.parents('li').find('.lilo a').removeClass("display-none");
            }
            // if (e.currentTarget.className.search('span_ticked') >= 0){
            //     self.parent().removeClass("selected");
            //     // self.removeClass("span_ticked");
            // }
            // e.stopPropagation();
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
                fields_show.push({string: $result.find('.input_l').val().trim(), sequence: sequence, name: $result.attr("name")});
                sequence += 1;
            });
            return fields_show;
        },
        resetShowField: function () {
            // var self = this;
            var values = {model: this.modelName, view_id: this.viewInfo.view_id};
            this._rpc({
                model: 'show.field',
                method: 'delete_show_fields',
                kwargs: {values: values},
            }).then(function (result) {
                location.reload();
            });
        },
        updateShowField: function () {
            // var self = this;
            var values = {model: this.modelName, view_id: this.viewInfo.view_id, fields_show: this.getFieldsShow()};
            this._rpc({
                model: 'show.field',
                method: 'change_fields',
                kwargs: {values: values},
            }).then(function (result) {
                location.reload();
            });
        },
        onClickShowField: function(e){
            e.stopPropagation();
            var self = $(e.currentTarget);
            if (e.currentTarget.className.search('selected') >= 0) {
                self.find('input').addClass("display-block");
                self.find('a').addClass("display-none");
            }
        },
    });
});