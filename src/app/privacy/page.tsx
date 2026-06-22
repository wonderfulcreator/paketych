export const metadata = { title: "Политика конфиденциальности — Пакет Пакетыч" };

export default function PrivacyPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="brand-heading text-3xl">Политика конфиденциальности</h1>
        <p className="mt-1 text-xs text-gray-400">Редакция от 08.06.2026 · С учётом изменений ФЗ-152 до 24.06.2025 № 156-ФЗ</p>

        <div className="prose prose-sm mt-6 max-w-none text-gray-700 leading-7">

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. Общие положения</h2>
          <p>Настоящая Политика конфиденциальности разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» в редакции от 24.06.2025 № 156-ФЗ, а также с учётом изменений, внесённых федеральными законами № 233-ФЗ (08.08.2024), № 519-ФЗ (28.12.2024), № 23-ФЗ (28.02.2025), № 121-ФЗ (23.05.2025) и № 156-ФЗ (24.06.2025).</p>
          <p className="mt-3">Оператором персональных данных является ООО «ОПТИМА ТЕКС» (ОГРН 1177847267179, ИНН 7802628963), юридический адрес: 195277, Санкт-Петербург, ул. Гельсингфорсская, д. 3, литера И, помещ. 107В (далее — Оператор, Компания).</p>
          <p className="mt-3">Использование сайта и заполнение регистрационной формы означает, что пользователь ознакомлен с настоящей Политикой. Согласие на обработку персональных данных даётся путём проставления соответствующей отметки в <a href="/privacy/consent" className="text-orange-500 hover:underline">отдельной форме согласия</a>.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. Состав обрабатываемых данных</h2>
          <p className="font-semibold mt-4">2.1. При регистрации и использовании сайта:</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Имя контактного лица</li>
            <li>Наименование организации</li>
            <li>Адрес электронной почты (e-mail)</li>
            <li>Номер контактного телефона</li>
            <li>Пароль (хранится в хэшированном виде, в открытом виде не обрабатывается)</li>
          </ul>
          <p className="font-semibold mt-4">2.2. При оформлении заказа:</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Список выбранных товарных позиций (наименования, артикулы, количество)</li>
            <li>Комментарий к заказу</li>
            <li>Желаемые сроки и пожелания к поставке</li>
          </ul>
          <p className="font-semibold mt-4">2.3. Автоматически собираемые данные:</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>IP-адрес устройства</li>
            <li>Тип и версия браузера, операционная система</li>
            <li>Файлы cookie — для аутентификации и аналитики</li>
            <li>Статистика посещений: просмотренные страницы, время визита, источник перехода</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">Сайт не собирает паспортные данные, СНИЛС, банковские реквизиты, биометрические данные и иные специальные категории персональных данных. Онлайн-оплата на сайте не предусмотрена.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. Цели и правовые основания обработки</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Цель</th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Правовое основание</th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Категория данных</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-200 px-3 py-2">Идентификация пользователя при входе</td><td className="border border-gray-200 px-3 py-2">Согласие субъекта (ст. 6 ч.1 п.1)</td><td className="border border-gray-200 px-3 py-2">ФИО, email, телефон</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2">Обработка и исполнение заказа, формирование КП</td><td className="border border-gray-200 px-3 py-2">Исполнение договора (ст. 6 ч.1 п.5)</td><td className="border border-gray-200 px-3 py-2">Все данные регистрации и заказа</td></tr>
                <tr><td className="border border-gray-200 px-3 py-2">Связь с пользователем по вопросам заказа</td><td className="border border-gray-200 px-3 py-2">Согласие + исполнение договора</td><td className="border border-gray-200 px-3 py-2">Email, телефон</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2">Анализ посещаемости, улучшение сайта</td><td className="border border-gray-200 px-3 py-2">Законный интерес оператора (ст. 6 ч.1 п.9)</td><td className="border border-gray-200 px-3 py-2">Обезличенные данные, cookie</td></tr>
                <tr><td className="border border-gray-200 px-3 py-2">Передача обезличенных данных в ГИС по запросу Минцифры</td><td className="border border-gray-200 px-3 py-2">Выполнение требований законодательства (ст. 23 ч.12)</td><td className="border border-gray-200 px-3 py-2">Только обезличенные данные</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2">Исполнение требований законодательства РФ</td><td className="border border-gray-200 px-3 py-2">Прямое требование закона (ст. 23 ч.3 п.1)</td><td className="border border-gray-200 px-3 py-2">По запросу уполномоченных органов</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. Место хранения данных</h2>
          <p>В соответствии с ч. 5 ст. 18 ФЗ-152 первичная запись, систематизация, накопление и хранение персональных данных граждан РФ осуществляется с использованием баз данных, физически расположенных на территории Российской Федерации.</p>
          <p className="mt-3">Оператор использует <strong>Yandex Cloud Managed Service for PostgreSQL</strong> — кластер баз данных в зоне доступности ru-central1 (Москва, Россия). Данная инфраструктура соответствует требованиям ФЗ-152 о локализации.</p>
          <p className="mt-3">Веб-приложение (программный код, изображения, публичный контент каталога) размещено на платформе Vercel Inc. (США). Персональные данные пользователей через данную инфраструктуру не передаются и не хранятся.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. Передача данных третьим лицам</h2>
          <p>Оператор не продаёт, не обменивает и не передаёт персональные данные третьим лицам в коммерческих целях. Передача данных возможна исключительно в случаях:</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>По запросу судов, Роскомнадзора, налоговых и иных уполномоченных органов государственной власти</li>
            <li>Обработчикам данных (Yandex Cloud — хранение БД; Vercel — хостинг без ПДн; Яндекс.Метрика — обезличенная аналитика; транспортным компаниям — для организации доставки)</li>
            <li>В виде обезличенных данных в государственные информационные системы по запросу Министерства цифрового развития РФ (ч. 12 ст. 23 ФЗ-152, Приказ РКН от 19.06.2025 № 140)</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">6. Права субъекта персональных данных</h2>
          <p>В соответствии со ст. 14–17 ФЗ-152 пользователь имеет право:</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Получить информацию об обработке своих данных: состав, цели, сроки, источники, получатели</li>
            <li>Требовать уточнения, блокирования или уничтожения данных, если они неполные, устаревшие или обрабатываются незаконно</li>
            <li>Отозвать согласие на обработку в любой момент (отзыв не влияет на законность ранее осуществлённой обработки)</li>
            <li>Обжаловать действия Оператора в Роскомнадзор (rkn.gov.ru) или в судебном порядке</li>
          </ul>
          <p className="mt-3">Для реализации прав направьте обращение на email: <a href="mailto:orders@paketpaketych.ru" className="text-orange-500 hover:underline">orders@paketpaketych.ru</a> с темой «Персональные данные». Срок ответа — 30 дней.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">7. Действия при утечке данных</h2>
          <p>В случае выявления неправомерной обработки или случайной передачи персональных данных Оператор обязан:</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>В течение 24 часов — уведомить Роскомнадзор о факте инцидента</li>
            <li>В течение 3 рабочих дней — прекратить неправомерную обработку</li>
            <li>В течение 72 часов — отчитаться перед Роскомнадзором по результатам расследования</li>
            <li>В течение 10 рабочих дней — уничтожить данные, если обеспечить правомерность обработки невозможно</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">8. Сроки хранения данных</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Категория данных</th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Срок хранения</th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Основание</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-200 px-3 py-2">Учётная запись (ФИО, email, телефон)</td><td className="border border-gray-200 px-3 py-2">До удаления + 3 года</td><td className="border border-gray-200 px-3 py-2">Ст. 196 ГК РФ</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2">Данные заказов</td><td className="border border-gray-200 px-3 py-2">5 лет с даты последней операции</td><td className="border border-gray-200 px-3 py-2">Ст. 29 ФЗ «О бухгалтерском учёте»</td></tr>
                <tr><td className="border border-gray-200 px-3 py-2">Согласие на обработку ПДн</td><td className="border border-gray-200 px-3 py-2">Срок действия договора + 3 года</td><td className="border border-gray-200 px-3 py-2">Требование для доказательства законности обработки</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2">Cookie и логи посещений</td><td className="border border-gray-200 px-3 py-2">До 1 года</td><td className="border border-gray-200 px-3 py-2">Технические нужды, аналитика</td></tr>
                <tr><td className="border border-gray-200 px-3 py-2">Уведомления об утечках</td><td className="border border-gray-200 px-3 py-2">Не менее 3 лет</td><td className="border border-gray-200 px-3 py-2">Требование РКН к документированию</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">9. Файлы cookie</h2>
          <p>Сайт использует файлы cookie для обеспечения функций аутентификации и анализа посещаемости. Cookie не содержат личных данных в явном виде. Пользователь вправе настроить браузер на отклонение cookie, однако в этом случае вход в учётную запись может быть недоступен.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">10. Меры по обеспечению безопасности</h2>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Шифрование передачи данных: HTTPS / TLS 1.3</li>
            <li>Хэширование паролей: алгоритм bcrypt</li>
            <li>Доступ к базе данных: только с авторизованных IP-адресов, аутентификация по сертификату</li>
            <li>Резервное копирование БД: ежедневно, хранение копий 30 дней</li>
            <li>Доступ к ПДн имеют только сотрудники, для которых это необходимо по должностным обязанностям</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">11. Изменение политики</h2>
          <p>Оператор вправе вносить изменения в настоящую Политику. Новая редакция вступает в силу с момента публикации на сайте. При существенных изменениях Оператор уведомляет пользователей по зарегистрированному email не позднее чем за 10 дней.</p>

          <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">12. Контакты</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr><td className="border border-gray-200 px-3 py-2 font-semibold w-48">Оператор</td><td className="border border-gray-200 px-3 py-2">ООО «ОПТИМА ТЕКС»</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-semibold">ИНН / ОГРН</td><td className="border border-gray-200 px-3 py-2">7802628963 / 1177847267179</td></tr>
                <tr><td className="border border-gray-200 px-3 py-2 font-semibold">Юридический адрес</td><td className="border border-gray-200 px-3 py-2">195277, Санкт-Петербург, ул. Гельсингфорсская, д. 3, литера И, помещ. 107В</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-200 px-3 py-2 font-semibold">Email (ПДн)</td><td className="border border-gray-200 px-3 py-2"><a href="mailto:orders@paketpaketych.ru" className="text-orange-500 hover:underline">orders@paketpaketych.ru</a> — тема «Персональные данные»</td></tr>
                <tr><td className="border border-gray-200 px-3 py-2 font-semibold">Роскомнадзор</td><td className="border border-gray-200 px-3 py-2">rkn.gov.ru · 8-800-222-15-52</td></tr>
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-xs text-gray-400">Редакция 08.06.2026 · Составлена с учётом ФЗ-152 в редакции до 24.06.2025 № 156-ФЗ</p>
        </div>
      </div>
    </div>
  );
}
