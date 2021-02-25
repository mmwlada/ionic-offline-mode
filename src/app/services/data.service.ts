import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

export interface Message {
  fromName: string;
  subject: string;
  date: string;
  id: number;
  read: boolean;
}

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'my-auth-token',
  }),
};

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private static handleError(error): any {
    let result: any;

    if (error.error instanceof ErrorEvent) {
      // client-side error
      result = `Error: ${error.error.message}`;
    } else {
      // server-side error
      result = DataService.getServerError(error); // `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(result);
  }

  private static getServerError(error: HttpErrorResponse): any {
    switch (error.status) {
      case 404: {
        return `Not Found: ${error.message}`;
      }
      case 403: {
        return `Access Denied: ${error.message}`;
      }
      case 401: {
        return `User unknown: ${error.message}`;
      }
      case 500: {
        return {
          status: error.status,
          message: `Internal Server Error: ${error.message}`,
          errors: error.error.errors
        };
      }
      case 400: {
        return {
          status: error.status,
          message: `Bad input: ${error.message}`,
          errors: error.error.errors
        };
      }
      default: {
        return `Unknown Server Error: ${error.message}. ${JSON.stringify(error.error)}`;
      }

    }
  }

  public getAll(path: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${path}`, httpOptions)
      .pipe(map((response: any) => response.data))
      .pipe(catchError(DataService.handleError));
  }

  public getById(path: string, id: string): Observable<Message> {
    return this.http
      .get(`${this.apiUrl}/${path}/${id}`, httpOptions)
      .pipe(map((response: any) => response.data))
      .pipe(catchError(DataService.handleError));
  }

  public getByIdErr(path: string, id: string): Observable<Message> {
    return this.http
      .get(`${this.apiUrl}/testError`, httpOptions)
      .pipe(map((response: any) => response.data))
      .pipe(catchError(DataService.handleError));
  }
}
