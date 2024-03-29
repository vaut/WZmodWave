# Wave Defense MOD
Мод добавляет режим отражения волн.
В этом режиме вы начинаете на южной границе карты. Вам доступна только узкая полоска земли, остальная територия закрыта. Вам дается 4 минуты на подготовку к первому нападению.
При завершении отсчета карта увеличивается на 10 клеток и высаживается волна противников. После убийства всех противников вам дается 2 минуты на подготовку к следующей высадке.
Победой является открытие всей карты.

## Особенности о которых нужно знать
- Волны всегда на острие технологий. Теоретически вы можете открывать компоненты одновременно с ботом, но в реальном бою вы будете отставать.
- Количество юнитов в десанте увеличивается со временем (зависимость квадратичная). Так же количество юнитов зависит от количества нефтевышек доступных игрокам (зависимость линейная).
- В десанте есть втол.
- Лимиты зависят от количества доступной нефти на карте. Больше нефти, доступно больше юнитов и строений.
- Лимиты строений на команду одинаковые. Нет разницы играете вы один или в девятером.
- Мод не поддерживает сохранения и загрузки.

## Как запустить.
1. Установите мод карту 10c-Stone-Jungle-v3w.wz
2. Выбирете карту на 10 игроков 10c-Stone-Jungle-v3w.wz
3. Включите одного бота waveAI на последний слот. Сложностью бота можно регулировать количество юнитов в десантах.

## Тюнинг и выбор карты

### Выбор карты
Мод будет работать на любой карте, но рекомендуется карта 10c-Stone-Jungle-v3w.wz.
Поддерживается режим расширение карты только на север. В комплекте с модом идет карта 10c-ntw_trail10pro2.wz и набор настроек для этой карты multiplay/script/rules/settings.json_ntw_trail10pro2.
Замените замените содержимое multiplay/script/rules/settings.json для выбора этих настроек.

При выборе другой карты учитывайте следующие особенности.
- не должно быть изолированных зон. В них может попасть десант.
- не должно быть больших зон обрывов.
- в центре карты (на южной границе при одностороннем расширении) должна быть зона для ваших баз. Точки респауна не зависят от местоположения HQ на карте.


### Тюнинг
Варзона не поддерживает передачу доп параметров в мод. Так что все настройки находятся в самом моде.
Файл `multiplay/script/rules/settings.json`:

```text
{
	"protectTimeM": 4, # время в минутах перед первой волной
	"totalGameTime": 90, # время в минутах через которое юниты дохотят до 16 ранга
	"expansion": 10, # количество клеток на которое увеличивается карта при десанте
	"startHeight": 35, # радиус стартовой зоны (высота при выборе одностороннего расширения)
	"Kpower" : 0.25, # коэффициент при времени влияющий на размер волн
	"doublePowerM": 20, # коэффициент при квадрате времени влияющий на размер волн
	"pauseM": 2, # время между волнами в минутах
	"inWavePauseS": 11, # время между десантом в одной волне в секундах
	"timeHandicapM": 0.5 # небольшое отставание по исследованиям у бота в минутах
	"Kfinal": 2, # во сколько раз финальная волна больше обычных
	"expansionDirection" : "north"/"all" # направлене расшинения карты только на север или во все стороны 
}
```

## Хитрости по прохождению

- бот не различает армию, стенку или другой дефф. Он будет ломать все от зоны десанта, до твоей базы. Можно использовать дешевые строения как ложные цели.
- состав армии в десанте зависит только от времени. Можно подобрать более эффективные ходовые и тела под юнитов в высадке
- сенсорных юнитов в армии нет. Основная арта и сенсоры укреплениях.
- через примерно час игры количество юнитов в десанте становится очень большим. Нужно пытаться победить до этого времени.
- можно дать себе немного времени на восстановление не добивая последних юнитов. Но помните, чем дольше вы тяните тем сильнее волна. ПВО, ВТОЛ и укрепления не блокируют следующую волну.
- не забывайте достраивать строения по мере увеличения лимитов
- десант высаживается очень плотно и около половины юнитов на "хрупких" ходовых. Попробуйте их быстро убивать атаками с большим сплешом.
- благодоря ветам юниты у бота очень прочные.

