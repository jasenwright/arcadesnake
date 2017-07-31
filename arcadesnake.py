# all the imports
import os
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, \
                  abort, render_template, flash

DATABASE=os.path.join(app.root_path, 'arcadesnake.db'),
SECRET_KEY='my_precious'

app = Flask(__name__) # create the application instance :)
app.config.from_object(__name__) # load config from this file , arcadesnake.py

def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv

def init_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

@app.cli.command('initdb')
def initdb_command():
    """Initializes the database."""
    init_db()
    print('Initialized the database.')

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/play', methods=['GET', 'POST'])
def play_game():
    error = None
    if request.method == 'POST':
        if not request.form['username']:
            error = 'You have to enter a username'
        else:
            db = get_db()
            db.execute('insert into scoreEntries (username, score) values (?, ?)',
                         [request.form['username'], request.form['score']])
            db.commit()
            flash('Highscore was successfully posted')
            return redirect(url_for('play_game'))
    return render_template('snake.html', error=error)

@app.route('/leaderboard')
def show_entries():
    db = get_db()
    cur = db.execute('select username, score from scoreEntries order by score desc limit 10')
    scoreEntries = cur.fetchall()
    return render_template('leaderboard.html', scoreEntries=scoreEntries)

@app.route('/about')
def about():
    return render_template('about.html')
