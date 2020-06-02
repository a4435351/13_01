odoo.define('dynamic_listview_advance_odoo_v81.list_view', function(require) {

    var ListView = require('web.ListView');

    ListView.include({
        init: function (viewInfo, params) {
            this._super(viewInfo, params);
            this.rendererParams.viewInfo = viewInfo;
            // this.renderer.controller = this;
            // if (parent.searchview) {
            //     parent.searchview.listViewRender = renderer;
            // }
        }
    });

});
