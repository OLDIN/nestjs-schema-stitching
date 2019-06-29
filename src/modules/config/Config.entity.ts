import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'config'
})
export class Config extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ['qrcode', 'barcode'],
    nullable: false,
    default: 'qrcode'
  })
  opticalLabelType!: string;

  @Column({
    type: 'enum',
    enum: ['en', 'ru'],
    nullable: false,
    default: 'ru'
  })
  defaultLang!: string;

  @Column({
    type: 'int',
    default: 15,
    comment: 'время (в минутах) за сколько до начала мероприятия можно начать чекинить'
  })
  timeToCheckIn!: number;

  @Column({
    comment: 'Указывает включено ли определение цены на арене учитывая тип людей',
    default: false
  })
  typeOfPeopleEnabled!: boolean;

}
