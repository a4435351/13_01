{
    'name': 'Dynamic ListView',
    'summary': 'Dynamic ListView',
    'version': '1.0',
    'category': 'Web',
    'description': """
        Dynamic ListView. Change The Odoo List view On the fly without any technical knowledge
    """,
    'author': "Yee Software",
    'depends': ['web'],
    'data': [
        'views/templates.xml',
        'security/show_fields_security.xml',
        'security/ir.model.access.csv',
    ],
    'qweb': [
        'static/src/xml/base.xml',
    ],
    'images': ['images/main_screen.jpg'],
    'price': 110,
    'license': 'OPL-1',
    'currency': 'EUR',
    'installable': True,
    'auto_install': False,
    'application': False,
    'images': [
        'static/description/module_image.png',
    ],
}
