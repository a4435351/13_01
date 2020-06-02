odoo.define('dynamic_listview_advance_odoo_v81.search_view', function (require) {
    "use strict";

    var core = require('web.core');
    var ControllerPanel = require('web.ControlPanelController');

    ControllerPanel.include({
        init: function (parent, dataset, fvg, options) {
            this._super.apply(this, arguments);
            parent.searchview = this;
        },
        getSearchQuery: function () {
            let res = this._super();
            if (this.listViewRender) {
                var domains = this.listViewRender._prepareSearchDomains();
                if (res.domain.length >= 1) {
                    res.domain = res.domain.concat(domains);
                }else {
                    res.domain = domains;
                }
            }
            return res
        }
    });
});
