drop table if exists scoreEntries;
create table scoreEntries (
  user_id integer primary key autoincrement,
  username text not null,
  score integer not null
);
