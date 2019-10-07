export class Agenda {
    rest: number = 0
    datareal: Date;
    constructor(public data: string,
                public datashow: string,
                public hora: string,
                public diasemana: string,
                public code: string,
                public userId?: string, 
                public agendaId?: string, 
                public sex?: string,     
            ) {}

}