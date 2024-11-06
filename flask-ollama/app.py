
from flask import Flask, render_template, request, jsonify
import requests
import json



app=Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")
@app.route("/generate", methods=['POST'])
def generate():
    # get을 테스트
    msg = request.json.get('query')
    url = "http://localhost:11434/api/generate"
    data ={
        "model" :"llama3.2"
        ,"prompt" : msg
    }
    headers= {"Content-Type":"application/json"}
    res = requests.post(url, json=data, headers= headers)
    if res.status_code ==200:
        try:
            res_text = res.text
            # 스트리밍 응답을 결합해서
            res_lines = res_text.splitlines()
            combine_res =""
            for line in res_lines:
                #각 줄이 json 형식인지 확인하고 처리
                try:
                    line_json = json.loads(line)
                    combine_res += line_json.get('response','')
                except json.JSONDecodeError:
                    continue
            return jsonify(responses=combine_res)
        except Exception as e:
            return jsonify(error = str(e)), 500
    else:
        return jsonify(error=f"error {res.status_code}"), res.status_code

if __name__ == '__main__':
    app.run(debug=True)