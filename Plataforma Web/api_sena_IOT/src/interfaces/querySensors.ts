export interface IQuerySensors {
    farm: string ;
    sensor?: string | undefined | null;
    dateStart: string | undefined;
    dateEnd: string | undefined;
    type: string ;
    value: number | string ;
}