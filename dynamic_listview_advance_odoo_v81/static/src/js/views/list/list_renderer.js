odoo.define('dynamic_listview_advance_odoo_v81.list_renderer', function(require) {

    var ListRenderer = require('web.ListRenderer');
    var relational_fields = require('web.relational_fields');
    var FieldMany2One = require('web.relational_fields').FieldMany2One;
    var Widget = require('web.Widget');
    var BasicModel = require('web.BasicModel');
            var widget = new Widget();
            var model = new BasicModel(widget);

    ListRenderer.include({
        init: function (parent, state, params) {
            this._super(parent, state, params);
            this.viewInfo = params.viewInfo;
            this.search_domain = {};
            this.parent = parent;
            this.showSearchAdvance = this.viewInfo ? true : false;

            this.fieldRender = {char: {render: this.renderFieldInput.bind(this)}, float: {render: this.renderFieldInput.bind(this)},
                                int: {render: this.renderFieldInput.bind(this)}, many2one: {render: this.renderFieldMany2one.bind(this)},
                                date: {render: this.renderFieldDate.bind(this)}, datetime: {render: this.renderFieldDate.bind(this)},
                                selection: {render: this.renderFieldSelection.bind(this)}
                }
        },
        renderFieldMany2one: function (field, container) {
            let self = this;
            const {name} = field;
            // var many2many_tag = new relational_fields.FieldMany2ManyTags(self,
            //     name, this.state, {mode: 'edit', viewType: "list"});
            // many2many_tag.appendTo(container);
            var many2one = new FieldMany2One(self, name, {...this.state, domain: [], getContext: () => {return []}, getDomain: () => {return []}}, {
                mode: 'edit',
                viewType: this.viewType,
            });
            // var _renderElement = many2one.renderElement;
            // const _render = function () {
            //     _renderElement();
            //     alert("ok");
            // }
            // many2one.renderElement =
            many2one.appendTo(container).then(function () {
                many2one.$el.find("input").val(self.search_domain[name] || null);
            });
            const _setValue = function (value, options) {
                if (this.lastSetValue === value || (this.value === false && value === '')) {
                    return $.when();
                }
                this.lastSetValue = value;
                value = this._parseValue(value);
                this.$input.val(value.display_name);
                value ? (self.search_domain[name] = value.display_name) : (delete self.search_domain[name]);
                self._searchRenderData();
                var def = $.Deferred();
                return def;
            }

            many2one._setValue = _setValue.bind(many2one);
        },
        _selectCell: function (rowIndex, fieldIndex, options) {
            if (this.showSearchAdvance) {
                rowIndex -= 1;
            }
            return this._super(rowIndex, fieldIndex, options);
        },
        setRowMode: function (recordID, mode) {
            let res = this._super(recordID, mode);
            if (this.showSearchAdvance) {
                var $row = this._getRow(recordID);
                this.currentRow = $row.prop('rowIndex') - 2;
            }
            return res;
        },
        // _selectRow: function (rowIndex) {
        //     if (this.showSearchAdvance) {
        //         rowIndex -= 1;
        //     }
        //     return this._super(rowIndex);
        // },
        renderFieldInput: function (field, container) {
            let self = this, view = $('<input>'), {name} = field;
            // view.change(function () {
            //     let val = view.val();
            //     val ? (self.search_domain[name] = val) : (delete self.search_domain[name]);
            //     self._searchRenderData();
            // });
            view.keyup(function (e) {
                const value = $(e.currentTarget).val();
                value ? (self.search_domain[name] = value) : (delete self.search_domain[name]);
                if (e.keyCode == 13) {
                    self._searchRenderData();
                }
            });
            view.val(this.search_domain[name] || null);
            container.append(view);
        },
        renderFieldDate: function (field, container) {
            let self = this, {name} = field, view = $('<input name='+name+'>'), format = "DD/MM/YYYY",
                options = {autoUpdateInput: false, locale: {cancelLabel: 'Clear', format: format}};
            view.daterangepicker(options);
            view.change((ev) => {
                let value = ev.target.value;
                if (!value) {
                    delete self.search_domain[name];
                    self._searchRenderData();
                }
            });
            view.on('apply.daterangepicker', (ev, picker) => {
                const {startDate, endDate} = picker, val = startDate.format(format) + ' - ' + endDate.format(format);
                val ? (self.search_domain[name] = val) : (delete self.search_domain[name]);
                self._searchRenderData();
            });
            view.on('cancel.daterangepicker', () => {
                delete self.search_domain[name];
                self._searchRenderData();
            });
            view.val(this.search_domain[name] || null);
            container.append(view);
        },
        renderFieldSelection: function (field, container) {
            let self = this, {name} = field,
                view = $('<select><option></option></select>');
            field.selection.map((option) => {
                const [value, name] = option;
                view.append($('<option value='+value+'>'+name+'</option>'));
            });
            view.change(function () {
                let val = view.val();
                val ? (self.search_domain[name] = val) : (delete self.search_domain[name]);
                self._searchRenderData();
            });
            view.val(this.search_domain[name] || null);
            container.append(view);
        },
        _renderHeader: function (isGrouped) {
            let res = this._super(isGrouped);
            if (this.showSearchAdvance) {
                let $tr = $('<tr>').append(_.map(this.columns, this._renderSearch.bind(this)));
                if (this.hasSelectors) {
                    $tr.prepend($('<th>'));
                }
                res.append($tr);
            }
            return res;
        },
        _prepareSearchDomains: function () {
            let result = [], fields = this.state.fields;
            Object.keys(this.search_domain).map((d, idx) =>{
                let field = fields[d], val = this.search_domain[d];
                if (field.type == 'datetime'){
                    val = val.split(" - ");
                    let formatClient = "DD/MM/YYYY", formatServer = "YYYY/MM/DD",
                        from = (moment(val[0], formatClient)).format(formatServer),
                        to = (moment(val[1] || val[0], formatClient)).format(formatServer);
                    result.push([d, '>=', `${from} 00:00:00`]);
                    result.push([d, '<=', `${to} 23:59:59`]);
                }else if (field.type == 'date') {
                    result.push([d, '=', val]);
                }else if (['int', 'float'].indexOf(field.type) >= 0) {
                    result.push([d, '=', parseFloat(val)]);
                }else {
                    result.push([d, 'ilike', val]);
                }
            });
            return result
        },
        _searchRenderData: function () {
            var searchView = this.getParent()._controlPanel;
            var search = searchView.getSearchQuery();
            searchView.trigger_up('search', search);
        },
        _renderSearch: function (node) {
            let name = node.attrs.name, $th = $('<th>'),
                field = {...this.state.fields[name], name: name};
            if (!field || !(field.type in this.fieldRender)) {
                return $th;
            }
            this.fieldRender[field.type].render(field, $th)
            return $th;
        },
        _hasContent: function () {
            let result = this._super();
            if (Object.keys(this.search_domain).length > 0) {
                return true;
            }
            return result;
        },

    });

});
