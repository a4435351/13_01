from odoo.models import BaseModel, AbstractModel
from odoo import api
from lxml import etree
import json
import odoo
# import odoo.SUPERUSER_ID

_load_views = AbstractModel.load_views
_fields_view_get = AbstractModel.fields_view_get


@api.model
def load_views(self, views, options=None):
    res = _load_views(self, views, options=options)
    return res

def list_view(self, data, res, view_id):
    data = data[0]
    doc = etree.XML(res['arch'])
    fields_show = eval(data.fields_show)
    config_view = eval(data.config_view) or {}
    field_base = {}
    tree_node = doc.xpath("//tree")
    for _tree_node in tree_node:
        for config_name in config_view.keys():
            val = config_view[config_name]
            if val:
                _tree_node.set(config_name, str(val))
            elif config_name in _tree_node.attrib:
                del _tree_node.attrib[config_name]
    for x in doc.xpath("//field"):
        if 'name' in x.attrib:
            field_base[x.attrib.get('name')] = x
            x.set("invisible", "1")
            doc.remove(x)
    for _field_name in fields_show:
        if _field_name['name'] in field_base:
            _field = field_base[_field_name['name']]
            _field.set("invisible", "0")
            _field.set("string", _field_name['string'])
            field_base.pop(_field_name['name'])
        else:
            _field = etree.Element(
                'field', {'name': _field_name['name'], 'string': _field_name['string']})
        doc.xpath("//tree")[0].append(_field)
    for _field_name in field_base:
        doc.xpath("//tree")[0].append(field_base[_field_name])
    res['arch'] = etree.tostring(doc)
    _arch, _fields = self.env['ir.ui.view'].postprocess_and_fields(
        self._name, etree.fromstring(res['arch']), view_id)
    res['arch'] = _arch
    res['fields'] = _fields


@api.model
def fields_view_get(self, view_id=None, view_type='form', toolbar=False, submenu=False):
    res = _fields_view_get(self, view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu)
    hide_button = True
    for_all = False
    if 'view.dynamic' in self.env.registry.models:
        view_dynamic = self.env['view.dynamic']
        domain = [('model', '=', self._name), ('view_id', '=', res.get('view_id', False)), ('create_uid', '=', self.env.user.id)]
        data_obj = view_dynamic.search(domain, limit=1)
        if len(data_obj) and data_obj[0].for_all:
            for_all = True
        if data_obj and view_type in ['list', 'tree']:
            list_view(self, data_obj, res, view_id)
        if view_type in ['pivot']:
            pass
        if view_type in ['graph']:
            pass
        if view_type in ['calendar']:
            pass

    res['fields_get'] = self.env[self._name].fields_get()
    res['for_all'] = for_all
    res['hide_button'] = hide_button
    return res


AbstractModel.load_views = load_views
AbstractModel.fields_view_get = fields_view_get
