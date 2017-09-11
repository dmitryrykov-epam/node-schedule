/**
 * Время пары.
 */
interface SlotTime {
    start: Date,
    end: Date,
}

/**
 * Список пар для универа.
 * Может быть много, так как есть вечернее обучение и 2я смена
 */
type Slots = SlotTime[];

/**
 * Просто занятие
 */
interface Lesson {
    name: string,
    lector: string[],
    room: string[],
    isPractice: boolean,
}

/**
 * Слот занятия показывает, какие занятия будут
 * Если у слота нет разделения на числитель и знаминатель, то оба свойства будут заполнены одинаковыми данными
 */
interface TimeSlot {
    numerator: Lesson,
    denominator: Lesson,
}

/**
 * Массив занятий в день. Индекс 0 содержит первое занаятие, 1 -> второе, и так далее
 * Значение `null` показывает, что занятия нет
 */
type DaySchedule = TimeSlot[];

/**
 * Список занятий по дням.
 * [0] => понедельник
 * [1] => вторник
 * [2] => среда
 * [3] => четверг
 * [4] => пятница
 * [5] => суббота
 * 
 * Значение `null` означает выходной
 */
type GroupSchedule = [DaySchedule, DaySchedule, DaySchedule, DaySchedule, DaySchedule, DaySchedule];

/**
 * Расписание по группам.
 * Ключ - номер группы
 * Значение - расписание для соответствующей группы
 */
interface LessonsSchedule {
    [group: string]: GroupSchedule,
}

interface ScheduleRequestAnswer {
    timeSlots: Slots,
    schedule: LessonsSchedule,
}