# Manual Real Fal Try-On Test Instructions — Vitrina AI Studio

Дата: 2026-05-18  
Цель: проверить, переносит ли `fal-ai/fashn/tryon/v1.6` именно исходное изделие на другую модель, а не создаёт случайную похожую одежду.

## Важно перед тестом

- Не выводить `FAL_KEY` в консоль, отчёты, screenshots или frontend.
- Не коммитить `.env.local`.
- Не запускать больше платных вызовов, чем разрешено:
  - `generate-model`: максимум 1 real call;
  - `tryon`: максимум 2 real calls;
  - `product-shot`: 0 calls;
  - `remove-background`: 0 calls до успешного try-on.
- Если `test-assets/source-lingerie.jpg` отсутствует, real test не запускать.

## Подготовка

1. Положите исходник товара сюда:

   `test-assets/source-lingerie.jpg`

2. В `.env.local` должны быть значения:

   ```env
   AI_MOCK_MODE=0
   FAL_KEY=...
   NEXT_PUBLIC_APP_NAME="Vitrina AI Studio"
   ```

3. Запустите dev server:

   ```bash
   npm run dev
   ```

4. Откройте:

   `http://localhost:3000/studio`

5. Убедитесь, что в header студии показано:

   `Реальный AI-режим`

## Настройки controlled test

### Шаг 1. Режим

Выберите:

- `Одежда на модели`

### Шаг 2. Товар

Загрузите файл:

- `test-assets/source-lingerie.jpg`

Если исходник — бельё на человеке, это важно: он должен идти как garment reference типа `model`, не `flat-lay`.

### Шаг 3. AI-модель

Выберите:

- модель: `Женская plus-size модель`;
- сценарий: `Бельё / купальники`;
- кадр: `В полный рост`;
- поза: `Прямо к камере` или `Лёгкий поворот`;
- фон: `Белый` или `Светло-серый`.

Нажмите:

- `Сгенерировать AI-модель`

Ожидаемая модель:

- adult model only;
- full-body или минимум torso-to-thigh;
- neutral commercial catalog pose;
- relaxed arms slightly away from torso;
- visible torso and hips;
- no sunglasses;
- no heavy jewelry;
- no props;
- no text/watermark;
- non-explicit, not sexualized.

### Шаг 4. Try-on settings

Для первого try-on call:

- `Тип товара`: `Авто`;
- `Тип исходного фото`: `Одежда на человеке`;
- `Качество`: `Максимальное качество`;
- `Количество вариантов`: `1`;
- moderation: `Разрешить бельё/купальники` / server value `permissive`;
- `segmentationFree`: `true`;
- `outputFormat`: `png`;
- `seed`: записать в отчёт.

Payload settings без ключа:

```json
{
  "model": "fal-ai/fashn/tryon/v1.6",
  "category": "auto",
  "garmentPhotoType": "model",
  "mode": "quality",
  "moderationLevel": "permissive",
  "numSamples": 1,
  "segmentationFree": true,
  "outputFormat": "png"
}
```

Если результат явно fail и лимит позволяет, второй try-on call:

```json
{
  "model": "fal-ai/fashn/tryon/v1.6",
  "category": "one-pieces",
  "garmentPhotoType": "model",
  "mode": "quality",
  "moderationLevel": "permissive",
  "numSamples": 1,
  "segmentationFree": true,
  "outputFormat": "png"
}
```

## Pass criteria

Результат считается pass, если:

- изделие визуально то же самое;
- чёрный основной цвет сохранился;
- зелёное кружево/узор сохранились;
- комплект верх + низ присутствует;
- общая форма и посадка близки к исходнику;
- модель другая;
- нет случайных очков;
- нет жёлтых стен, random lifestyle photo или чужого фона;
- нет чужой одежды вместо исходного изделия;
- изображение грузится без broken image;
- result card показывает `Fal AI`, а не `Демо-результат`.

## Fail criteria

Результат считается fail, если:

- цвет другой;
- изделие другое;
- появился случайный crop top или другой комплект;
- пропал низ комплекта;
- кружево/узор исчезли или стали случайными;
- модель сгенерирована как портрет/headshot;
- картинка broken;
- результат явно mock;
- UI скрывает проблему и предлагает скачать без ручной проверки.

## Если FASHN fail

Не запускать бесконечные попытки. Зафиксировать fail и следующие гипотезы:

1. Сделать flat-lay/cutout garment reference.
2. Отдельно вырезать верх и низ комплекта.
3. Проверить model swap/reference workflow, если доступен.
4. Попросить поставщика фото товара отдельно от модели.
5. Добавить manual mask/reference flow для сложных изделий.
