import requests
import time

class WeatherApp:
    def __init__(self, weather_api_key):
        self.weather_api_key = weather_api_key
    
    def get_location(self):
        """Определение текущего местоположения с использованием резервных сервисов"""
        location_services = [
            'https://ipapi.co/json/',
            'http://ip-api.com/json/',
            'https://api.ip.sb/geoip',
            'https://ipinfo.io/json'
        ]
        
        for service in location_services:
            try:
                print(f"Попытка определить местоположение через {service.split('/')[2]}...")
                response = requests.get(service, timeout=5)
                data = response.json()
                
                if service == 'https://ipapi.co/json/':
                    city = data.get('city')
                    country = data.get('country_name')
                elif service == 'http://ip-api.com/json/':
                    city = data.get('city')
                    country = data.get('country')
                elif service == 'https://api.ip.sb/geoip':
                    city = data.get('city')
                    country = data.get('country')
                elif service == 'https://ipinfo.io/json':
                    city = data.get('city')
                    country = data.get('country')
                
                if city and country:
                    print(f"Успешно! Определено: {city}, {country}")
                    return {'city': city, 'country': country}
                    
            except Exception as e:
                print(f"Сервис {service} недоступен: {e}")
                continue
        
        print("Все сервисы определения местоположения недоступны")
        return None
    
    def get_weather_by_city(self, city_name):
        """Получение погоды по названию города"""
        try:
            url = f"http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={self.weather_api_key}&units=metric&lang=ru"
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if response.status_code == 200:
                weather_info = {
                    'город': data['name'],
                    'погода': data['weather'][0]['description'].capitalize(),
                }
                return weather_info
            else:
                error_msg = data.get('message', 'Неизвестная ошибка')
                print(f"Ошибка API погоды: {error_msg}")
                return None
                
        except requests.exceptions.Timeout:
            print("Таймаут при запросе погоды")
            return None
        except Exception as e:
            print(f"Ошибка получения погоды: {e}")
            return None
    
    def display_weather(self, weather_data):
        """Красивый вывод информации о погоде"""
        if not weather_data:
            return
        
        
        icons = {
            'город': '🏙️',
            'погода': '☁️',
        }
        
        
        print("="*50)
        
        for key, value in weather_data.items():
            icon = icons.get(key, '📍')
            print(f"{icon} {key.capitalize()}: {value}")
        print("="*50)

def main():
    # Ваш API ключ
    API_KEY = "db59909405cd91be12249b3057652b34"
    
    app = WeatherApp(API_KEY)
    
    print("🌍 Определяем ваше местоположение...")
    location = app.get_location()
    
    if location and location['city']:
        weather = app.get_weather_by_city(location['city'])
        if weather:
            app.display_weather(weather)
        else:
            print(f"Не удалось получить погоду для {location['city']}")
            print("Попробуйте ввести город вручную")
    else:
        print("Не удалось автоматически определить местоположение")
        print("Вы можете ввести город вручную")
    

if __name__ == "__main__":
    main()