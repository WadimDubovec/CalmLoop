from http import HTTPStatus
from dashscope import VideoSynthesis
import dashscope
from dotenv import load_dotenv
import os

def sample_sync_call_t2v(prompt: str):
    # call sync api, will return the result
    print('please wait...')
    rsp = VideoSynthesis.call(model='wan2.5-t2v-preview', #wan2.2-t2v-plus
                              prompt=prompt,
                              size='832*480') #1920*1080
    print(rsp)
    if rsp.status_code == HTTPStatus.OK:
        print(rsp.output.video_url)
    else:
        print('Failed, status_code: %s, code: %s, message: %s' %
              (rsp.status_code, rsp.code, rsp.message))


if __name__ == '__main__':
    load_dotenv()
    API_KEY = os.getenv("API_KEY")
    dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'
    dashscope.api_key = API_KEY
    prompt = 'A fixed security camera angle of an empty parking lot at night. Rain falls steadily under a streetlight, creating looping ripples in a puddle. no camera movement.'
    sample_sync_call_t2v(prompt=prompt)