{
    'name': 'Dynamic ListView',
    'summary': 'Dynamic ListView',
    'version': '1.0',
    'category': 'Web',
    'description': """
        Dynamic Listview
    """,
    'author': "Yee software",
    'depends': ['web'],
    'data': [
        'views/templates.xml',
        'security/view_dynamic_security.xml',
        'security/ir.model.access.csv',
    ],
    'qweb': [
        'static/src/xml/base.xml',
    ],
    'price': 110,
    'currency': 'EUR',
    'license': 'OPL-1',
    'installable': True,
    'auto_install': False,
    'application': False,
    'images': [
        'static/description/module_image.jpg',
    ],
}
