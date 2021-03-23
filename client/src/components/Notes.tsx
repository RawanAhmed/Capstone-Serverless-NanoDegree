import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import Typist from 'react-typist'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Form
} from 'semantic-ui-react'

import { createNote, deleteNote, getNotes, patchNote } from '../api/notes-api'
import Auth from '../auth/Auth'
import { Note } from '../types/Note'

interface NotesProps {
  auth: Auth
  history: History
}

interface NotesState {
  notes: Note[]
  newNoteName: string
  loadingNotes: boolean
  nameInput: string
  dayOfWeekInput: string
}

export class Notes extends React.PureComponent<NotesProps, NotesState> {
  state: NotesState = {
    notes: [],
    newNoteName: '',
    loadingNotes: true,
    nameInput: '',
    dayOfWeekInput: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newNoteName: event.target.value })
  }

  onEditButtonClick = (noteId: string) => {
    this.props.history.push(`/notes/${noteId}/edit`)
  }

  onNoteCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dayOfWeek = this.calculateDayOfWeek()
      const newNote = await createNote(this.props.auth.getIdToken(), {
        name: this.state.newNoteName,
        dayOfWeek
      })
      this.setState({
        // newNote will appear first in order
        notes: [newNote, ...this.state.notes],
        newNoteName: ''
      })
    } catch {
      alert('Note creation failed')
    }
  }

  onNoteDelete = async (noteId: string) => {
    try {
      await deleteNote(this.props.auth.getIdToken(), noteId)
      this.setState({
        notes: this.state.notes.filter(note => note.noteId != noteId)
      })
    } catch {
      alert('Note deletion failed')
    }
  }

  onNoteCheck = async (pos: number) => {
    try {
      const note = this.state.notes[pos]
      await patchNote(this.props.auth.getIdToken(), note.noteId, {
        name: note.name,
        dayOfWeek: note.dayOfWeek,
        done: !note.done
      })
      this.setState({
        notes: update(this.state.notes, {
          [pos]: { done: { $set: !note.done } }
        })
      })
    } catch {
      alert('Note deletion failed')
    }
  }

  // DONE: Add interface to update 'name' and 'dayOfWeek'
  handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ nameInput: event.target.value })
  }

  handleDayOfWeekInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ dayOfWeekInput: event.target.value })
  }

  onNoteNameUpdate = async (pos: number) => {
    try {
      const note = this.state.notes[pos]
      await patchNote(this.props.auth.getIdToken(), note.noteId, {
        name: this.state.nameInput,
        dayOfWeek: note.dayOfWeek,
        done: note.done
      })
      this.setState({
        notes: update(this.state.notes, {
          [pos]: { name: { $set: this.state.nameInput } }
        })
      })
    } catch {
      alert('Note deletion failed')
    }
  }

  onNoteDayOfWeekUpdate = async (pos: number) => {
    try {
      const note = this.state.notes[pos]
      await patchNote(this.props.auth.getIdToken(), note.noteId, {
        name: note.name,
        dayOfWeek: this.state.dayOfWeekInput,
        done: note.done
      })
      this.setState({
        notes: update(this.state.notes, {
          [pos]: { dayOfWeek: { $set: this.state.dayOfWeekInput } }
        })
      })
    } catch {
      alert('Note deletion failed')
    }
  }
  // ------------------------------------------------------------------------------------


  async componentDidMount() {
    try {
      const notes = await getNotes(this.props.auth.getIdToken())
      this.setState({
        notes,
        loadingNotes: false
      })
    } catch (e) {
      alert(`Failed to fetch notes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Typist>
          <Header as="h1">Write Your Notes...</Header>
        </Typist>

        {this.renderCreateNoteInput()}

        {this.renderNotes()}
      </div>
    )
  }

  renderCreateNoteInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New note',
              onClick: this.onNoteCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Your Daily Note ...."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderNotes() {
    if (this.state.loadingNotes) {
      return this.renderLoading()
    }

    return this.renderNotesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading My Notes
        </Loader>
      </Grid.Row>
    )
  }

  renderNotesList() {
    return (
      <Grid padded>
        {this.state.notes.map((note, pos) => {
          return (
            <Grid.Row key={note.noteId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onNoteCheck(pos)}
                  checked={note.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {note.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {note.dayOfWeek}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(note.noteId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onNoteDelete(note.noteId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              
              <Grid.Column width={16}>
                {note.attachmentUrl && (
                  <Image src={note.attachmentUrl} size="small" wrapped />
                )}
                <Divider />
              </Grid.Column>

              <Grid.Column width={8}>
                <Form onSubmit={() => this.onNoteNameUpdate(pos)}>
                  <Form.Group inline>
                    <Form.Field>
                      <label>Name</label>
                      <input type='text' value={this.state.nameInput} onChange={this.handleNameInputChange} />
                    </Form.Field>
                    <Button icon color="blue" type='submit'>
                      <Icon name="pencil" />
                    </Button>
                  </Form.Group>
                </Form>
              </Grid.Column>
              <Grid.Column width={8}>
                <Form onSubmit={() => this.onNoteDayOfWeekUpdate(pos)}>
                  <Form.Group inline>
                    <Form.Field>
                      <label>Day of Week</label>
                      <input type='text' value={this.state.dayOfWeekInput} onChange={this.handleDayOfWeekInputChange} />
                    </Form.Field>
                    <Button icon color="blue" type='submit'>
                      <Icon name="pencil" />
                    </Button>
                  </Form.Group>
                </Form>
              </Grid.Column>

              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDayOfWeek(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    // Code from "calculateDueDate()" // return dateFormat(date, 'yyyy-mm-dd') as string
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }
}
