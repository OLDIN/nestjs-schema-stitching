
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class Cat {
    name: string;
}

export abstract class IQuery {
    abstract cats(): Cat[] | Promise<Cat[]>;
}
