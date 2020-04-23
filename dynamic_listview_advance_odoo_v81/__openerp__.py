{
    'name': 'Dynamic ListView Advance',
    'summary': 'Dynamic ListView Advance',
    'version': '1.0',
    'category': 'Web',
    'description': """
        Dynamic ListView Advance. Change The Odoo List view On the fly without any technical knowledge
    """,
    'author': "Yee Software",
    'depends': ['web'],
    'data': ['views/templates.xml',
             'security/show_fields_security.xml',
             'security/ir.model.access.csv'],
    'price': 110,
    'currency': 'EUR',
    'installable': True,
    'auto_install': False,
    'application': False,
    'qweb': ['static/src/xml/base.xml'],
    'images': [
        'static/description/module_image.png',
    ],
}
