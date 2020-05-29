from flask import Flask, request, jsonify
import json
from flask_cors import CORS
import pymongo
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from song_lists import song_list
import click
import time
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)
addr, port = '127.0.0.1', '27017'
base_url = 'mongodb://{}:{}'.format(addr, port)
client = pymongo.MongoClient(base_url)
database = client['Linkin']
SECRET_KEY = "peipei"


@app.cli.command("insert_songs")
# @click.argument("name")
def insert_all_songs():
    handler = SongHandler(database)
    handler.insert_initial_songs()
    click.echo(f'Finished!')


def generate_token(user_id):
    # 第一个参数是内部的私钥，这里写在共用的配置信息里了，如果只是测试可以写死
    # 第二个参数是有效期(秒)
    s = Serializer(SECRET_KEY, expires_in=36000)
    # 接收用户id转换与编码
    token = s.dumps({"id": user_id}).decode("ascii")
    return token


def verify_token(token):
    '''
    校验token
    :param token:
    :return: 用户信息 or None
    '''

    # 参数为私有秘钥，跟上面方法的秘钥保持一致
    s = Serializer(SECRET_KEY)
    try:
        # 转换为字典
        data = s.loads(token)
        print("data")
    except Exception:
        print("token_expired")
        return None
    handler = AccountHandler(database)
    return handler.search_existing_accounts({'_id': data['id']})


class SongHandler:
    def __init__(self, database):
        self.collection = database['Song']

    def insert_initial_songs(self):
        for song in song_list:
            self.collection.insert_one(song)

    def get_all_songs(self):
        results = self.collection.find({}, {"_id": 0})
        return [result for result in results]

    def search_song_detail(self, song_name):
        song_detail = self.collection.find_one({'Name': song_name}, {"_id": 0})
        print('song_detail:', song_detail)
        return song_detail


class AccountHandler:
    def __init__(self, database):
        self.collection = database['Accounts']

    def search_existing_accounts(self, login_info):
        print(login_info)
        if '_id' not in login_info.keys():
            result = self.collection.find(login_info, {"_id": 1})
        else:
            result = self.collection.find({'_id': ObjectId(login_info['_id'])}, {"_id": 1})
        print("search_result:", result[0]["_id"])
        return str(result[0]["_id"])

    def insert_new_account(self, user_application):
        self.collection.insert_one(user_application)


class CartHandler:
    def __init__(self, database):
        self.collection = database['Cart']

    def update_user_cart(self, user_id, cart_item):
        self.collection.update({'_id': ObjectId(user_id)}, {'$push': {'cart': cart_item}}, True)

    def upload_user_cart(self, user_id):
        cart = self.collection.find_one({'_id': ObjectId(user_id)}, {"cart": 1})
        print('cart:', cart)
        return cart['cart']

    def delete_user_cart_item(self, user_id, song_name):
        print(song_name)
        self.collection.update({'_id': ObjectId(user_id)}, {'$pull': {'cart': {'Name': song_name}}})

    def retrieve_all_cart_items(self, user_id):
        order_items = self.collection.find_one({'_id': ObjectId(user_id)})
        self.collection.update({'_id': ObjectId(user_id)}, {'cart': []})
        return order_items


class OrderHandler:
    def __init__(self, database):
        self.collection = database['Order']

    def insert_order(self, order):
        submit_time = time.time()
        order['time'] = submit_time
        order['user_id'] = order['_id']
        del order['_id']
        self.collection.insert_one(order)

    def retrieve_user_orders(self, user_id):
        result_dict = list()
        orders = self.collection.find({'user_id': ObjectId(user_id)})
        print("orders:", orders)
        for order in orders:
            order['_id'] = str(order['_id'])
            order['user_id'] = str(order['user_id'])
            result_dict.append(order)
        return result_dict


@app.route('/login', methods=['POST'])
def login():
    print("api:login")
    if request.method == "POST":
        login_info = json.loads(request.get_data())
        handler = AccountHandler(database)
        user_id = handler.search_existing_accounts(login_info)
        if user_id:
            token = generate_token(user_id)
            print("token:", token)
            return jsonify(code=200, feedback="success", token=token)
        else:
            return jsonify(code=200, feedback="success", token=None)


@app.route('/signup', methods=['POST'])
def signup():
    print("api:signup")
    if request.method == "POST":
        user_application = json.loads(request.get_data())
        print(type(user_application))
        handler = AccountHandler(database)
        handler.insert_new_account(user_application)
        return json.dumps({"feedback": "success"})


@app.route('/initialize', methods=['POST'])
def initialize():
    print("api:initialize")
    if request.method == "POST":
        handler = SongHandler(database)
        songs = handler.get_all_songs()
        return jsonify(code=200, feedback="success", data=songs)


@app.route('/load_detail', methods=['POST'])
def load_detail():
    print("api:load_detail")
    if request.method == "POST":
        proposed_id = verify_token(request.headers['Authorization'])
        print("proposed_id:", proposed_id)
        # 验证是否存在该用户
        if proposed_id is None:
            print("token is none")
            return jsonify(code=200, feedback="failure", msg="token expired or not login")
        else:
            song_application = json.loads(request.get_data())
            song_name = song_application['song_name']
            handler = SongHandler(database)
            song_detail = handler.search_song_detail(song_name)
            return jsonify(code=200, feedback="success", data=song_detail)


@app.route('/update_cart', methods=['POST'])
def update_cart():
    print("api:update_cart")
    if request.method == "POST":
        proposed_id = verify_token(request.headers['Authorization'])
        if proposed_id is None:
            print("token is none")
            return jsonify(code=200, feedback="failure", msg="token expired or not login")
        else:
            cart_item = json.loads(request.get_data())
            print(cart_item)
            handler = CartHandler(database)
            handler.update_user_cart(proposed_id, cart_item)
            return jsonify(code=200, feedback="success")


@app.route('/upload_cart', methods=['POST'])
def upload_cart():
    print("api:upload_cart")
    if request.method == "POST":
        proposed_id = verify_token((request.headers['Authorization']))
        if proposed_id is None:
            return jsonify(code=200, feedback="failure", msg="token expired or not login")
        else:
            handler = CartHandler(database)
            cart_items = handler.upload_user_cart(proposed_id)
            print(cart_items)
            return jsonify(code=200, feedback="success", data=cart_items)


@app.route('/delete_cart_item', methods=['POST'])
def delete_cart_item():
    print("api:delete_cart_item")
    if request.method == "POST":
        proposed_id = verify_token((request.headers['Authorization']))
        if proposed_id is None:
            return jsonify(code=200, feedback="failure", msg="token expired or not login")
        else:
            song_name = json.loads(request.get_data())['song']
            print('song_name:', song_name)
            handler = CartHandler(database)
            handler.delete_user_cart_item(proposed_id, song_name)
            return jsonify(code=200, feedback="success")


@app.route('/submit_order', methods=['POST'])
def submit_order():
    print("api:submit_order")
    if request.method == "POST":
        proposed_id = verify_token(request.headers['Authorization'])
        if proposed_id is None:
            return jsonify(code=200, feedback='failure', msg="token expired or not login")
        else:
            cart_handler = CartHandler(database)
            order = cart_handler.retrieve_all_cart_items(proposed_id)
            order_handler = OrderHandler(database)
            order_handler.insert_order(order)
            return jsonify(code=200, feedback='success')


@app.route('/upload_order', methods=['POST'])
def upload_order():
    print("api:upload_order")
    if request.method == "POST":
        proposed_id = verify_token(request.headers['Authorization'])
        if proposed_id is None:
            return jsonify(code=200, feedback='failure', msg="token expired or not login")
        else:
            order_handler = OrderHandler(database)
            orders = order_handler.retrieve_user_orders(proposed_id)
            print("upload order:",orders)
            return jsonify(code=200, feedback='success', data=orders)


if __name__ == '__main__':
    app.run()
