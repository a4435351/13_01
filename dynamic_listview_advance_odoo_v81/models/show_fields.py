from odoo import fields, models, api


class DynamicView(models.Model):
    _name = "view.dynamic"

    fields_show = fields.Char(string="Fields Show", default="[]")
    config_view = fields.Char(string="Config", default="{}")
    model = fields.Char(string="Model Name")
    view_id = fields.Many2one(string="View id", comodel_name="ir.ui.view")
    for_all = fields.Boolean(string="Apply for All Users", default=False)

    @api.model
    def restore_view(self, view_id=False):
        if view_id:
            self.search([['view_id', '=', view_id]]).unlink()

    @api.model
    def get_all_users(self):
        data = self.env['res.users'].search([])
        return [{'id': x.id, 'name': x.login} for x in data]

    @api.model
    def change_fields(self, values):
        records = self.search([("model", "=", values.get("model", False)),
                               ("create_uid", "=", self.env.user.id),
                               ("view_id", '=', values.get("view_id", False))])
        values['fields_show'] = str(values.get('fields_show', {}))
        values['config_view'] = str(values.get('config_view', {}))
        if records:
            records[0].write(values)
        else:
            self.create(values)
        return True

    @api.model
    def copy_record(self, model_name, record_ids):
        if model_name and record_ids:
            obj = self.env[model_name]
            [obj.browse(record_id).copy() for record_id in record_ids]


DynamicView()
